import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// include data migration function in with-clause

actor {
  // File Storage System
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Data Types ---

  type ProductStatus = {
    #stock;
    #sold;
  };

  type Product = {
    id : Nat;
    name : Text;
    photoUrl : Text;
    costPrice : Float;
    sellingPrice : Float;
    status : ProductStatus;
    createdAt : Int;
  };

  type ProductInput = {
    name : Text;
    photoUrl : Text;
    costPrice : Float;
    sellingPrice : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  // --- State ---

  var nextProductId = 1;
  let products = Map.empty<Nat, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // --- User Profile Functions ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Authorization Helpers ---

  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // --- Product Management Functions ---

  public shared ({ caller }) func addProduct(input : ProductInput) : async Nat {
    requireUser(caller);

    let product : Product = {
      id = nextProductId;
      name = input.name;
      photoUrl = input.photoUrl;
      costPrice = input.costPrice;
      sellingPrice = input.sellingPrice;
      status = #stock;
      createdAt = Time.now();
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public query ({ caller }) func getStockProducts() : async [Product] {
    requireUser(caller);
    products.values().toArray().filter(func(p) { p.status == #stock });
  };

  public query ({ caller }) func getSoldProducts() : async [Product] {
    requireUser(caller);
    products.values().toArray().filter(func(p) { p.status == #sold });
  };

  public shared ({ caller }) func toggleProductStatus(productId : Nat) : async () {
    requireUser(caller);

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with
          status = switch (product.status) {
            case (#stock) { #sold };
            case (#sold) { #stock };
          };
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    requireUser(caller);

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    requireUser(caller);
    products.values().toArray();
  };
};
