import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

module {
  // Original actor's persistent types.
  type Sale = {
    id : Nat;
    productId : Nat;
    quantity : Nat;
    totalPrice : Nat;
    costPrice : Nat;
    profit : Nat;
    timestamp : Int;
  };

  type Product = {
    id : Nat;
    name : Text;
    quantity : Nat;
    costPrice : Nat;
    sellingPrice : Nat;
    sales : [Sale];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    productMap : Map.Map<Nat, Product>;
    saleMap : Map.Map<Nat, Sale>;
    productId : Nat;
    nextSaleId : Nat;
  };

  // New actor's persistent types.
  type ProductStatus = { #stock; #sold };

  type NewProduct = {
    id : Nat;
    name : Text;
    photoUrl : Text;
    costPrice : Float;
    sellingPrice : Float;
    status : ProductStatus;
    createdAt : Int;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    products : Map.Map<Nat, NewProduct>;
    nextProductId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.productMap.map<Nat, Product, NewProduct>(
      func(_id, oldProduct) {
        {
          id = oldProduct.id;
          name = oldProduct.name;
          photoUrl = "";
          costPrice = oldProduct.costPrice.toFloat();
          sellingPrice = oldProduct.sellingPrice.toFloat();
          status = #stock;
          createdAt = 0;
        };
      }
    );
    {
      userProfiles = old.userProfiles;
      products = newProducts;
      nextProductId = old.productId;
    };
  };
};
