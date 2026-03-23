
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // File Storage System
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  // Inventory Application Types
  type Product = {
    id : Nat;
    name : Text;
    quantity : Nat;
    costPrice : Nat;
    sellingPrice : Nat;
    sales : [Sale];
  };

  type Sale = {
    id : Nat;
    productId : Nat;
    quantity : Nat;
    totalPrice : Nat;
    costPrice : Nat;
    profit : Nat;
    timestamp : Time.Time;
  };

  type ProductInfo = {
    id : Nat;
    name : Text;
    quantity : Nat;
    costPrice : Nat;
    sellingPrice : Nat;
  };

  type SaleInfo = {
    id : Nat;
    productId : Nat;
    quantity : Nat;
    totalPrice : Nat;
    costPrice : Nat;
    profit : Nat;
    timestamp : Time.Time;
  };

  type ProductInput = {
    name : Text;
    quantity : Nat;
    costPrice : Nat;
    sellingPrice : Nat;
  };

  let productMap = Map.empty<Nat, Product>();
  let saleMap = Map.empty<Nat, Sale>();

  var productId = 0;
  var nextSaleId = 1;

  func getProductInternal(id : Nat) : Product {
    switch (productMap.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  func getSaleInternal(id : Nat) : Sale {
    switch (saleMap.get(id)) {
      case (null) { Runtime.trap("Sale not found") };
      case (?sale) { sale };
    };
  };

  public shared ({ caller }) func addProduct(productInput : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    if (productInput.name == "") {
      Runtime.trap("Product name cannot be empty");
    };

    if (productInput.costPrice > productInput.sellingPrice) {
      Runtime.trap("Selling price cannot be lower than the cost price");
    };

    let product = {
      id = productId;
      name = productInput.name;
      quantity = productInput.quantity;
      costPrice = productInput.costPrice;
      sellingPrice = productInput.sellingPrice;
      sales = [];
    };

    productMap.add(productId, product);
    productId += 1;
    product.id;
  };

  public shared ({ caller }) func editProduct(id : Nat, productInput : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit products");
    };

    let product = getProductInternal(id);

    let updatedProduct = {
      id = product.id;
      name = productInput.name;
      quantity = productInput.quantity;
      costPrice = productInput.costPrice;
      sellingPrice = productInput.sellingPrice;
      sales = product.sales;
    };

    productMap.add(id, updatedProduct);
  };

  public shared ({ caller }) func removeProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };

    ignore getProductInternal(id);

    productMap.remove(id);
  };

  public shared ({ caller }) func sellProduct(productId : Nat, quantity : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can sell products");
    };

    let product = getProductInternal(productId);

    if (quantity > product.quantity) {
      Runtime.trap("Not enough quantity in stock");
    };

    let totalPrice = product.sellingPrice * quantity;
    let costPrice = product.costPrice * quantity;
    let profit = totalPrice - costPrice;

    let sale : Sale = {
      id = nextSaleId;
      productId;
      quantity;
      totalPrice;
      costPrice;
      profit;
      timestamp = Time.now();
    };

    let updatedProduct = {
      product with
      quantity = product.quantity - quantity;
      sales = product.sales.concat([sale]);
    };

    productMap.add(productId, updatedProduct);

    saleMap.add(nextSaleId, sale);

    nextSaleId += 1;
    sale.id;
  };

  public query ({ caller }) func getProduct(id : Nat) : async ProductInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    let product = getProductInternal(id);
    productToProductInfo(product);
  };

  public query ({ caller }) func getProductsByName(searchTerm : Text) : async [ProductInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    productMap.values().toArray().map(func(product) { productToProductInfo(product) });
  };

  func productToProductInfo(product : Product) : ProductInfo {
    {
      id = product.id;
      name = product.name;
      quantity = product.quantity;
      costPrice = product.costPrice;
      sellingPrice = product.sellingPrice;
    };
  };

  public query ({ caller }) func getAllProducts() : async [ProductInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    productMap.values().toArray().map(func(product) { productToProductInfo(product) });
  };

  public query ({ caller }) func getAllSales() : async [SaleInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };

    saleMap.values().toArray().map(func(sale) { saleToSaleInfo(sale) });
  };

  func saleToSaleInfo(sale : Sale) : SaleInfo {
    sale;
  };
};
