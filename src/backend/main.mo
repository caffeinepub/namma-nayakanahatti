import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type VendorCategory = { #temple; #restaurant; #grocery; #pharmacy };
  type VendorStatus = { #open; #closed };
  type ProductCategory = { #food; #pooja; #grocery; #medicine };
  type StockStatus = { #inStock; #outOfStock };
  type OrderStatus = { #pending; #preparing; #outForDelivery; #delivered; #cancelled };

  public type UserProfile = {
    name : Text;
    phone : Text;
    address : Text;
  };

  public type Vendor = {
    id : Nat;
    name : Text;
    category : VendorCategory;
    description : Text;
    address : Text;
    status : VendorStatus;
    isEcoDelivery : Bool;
  };

  public type Product = {
    id : Nat;
    name : Text;
    vendorId : Nat;
    price : Nat;
    category : ProductCategory;
    stockStatus : StockStatus;
    description : Text;
  };

  public type Order = {
    id : Nat;
    customerId : Principal;
    vendorId : Nat;
    status : OrderStatus;
    totalAmount : Nat;
    deliveryAddress : Text;
    landmarkNotes : Text;
    scheduledTime : ?Time.Time;
    driverId : ?Principal;
    createdAt : Time.Time;
  };

  public type OrderItem = {
    orderId : Nat;
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Pre-seed admin principals
  let _seedAdmin1 = accessControlState.userRoles.add(
    Principal.fromText("aopul-z43np-txzlu-loqz2-a2xsx-vvyei-gmhi5-wrv2u-xy4fn-vdsmu-pae"),
    #admin
  );
  accessControlState.adminAssigned := true;

  let vendors = Map.empty<Nat, Vendor>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let orderItems = Map.empty<Nat, [OrderItem]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextVendorId = 1;
  var nextProductId = 1;
  var nextOrderId = 1;

  // User Profile
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

  // Vendor CRUD
  public shared ({ caller }) func createVendor(vendor : Vendor) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create vendors");
    };
    let id = nextVendorId;
    nextVendorId += 1;
    let newVendor = { vendor with id };
    vendors.add(id, newVendor);
    id;
  };

  public shared ({ caller }) func updateVendor(id : Nat, vendor : Vendor) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update vendors");
    };
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?_) {
        vendors.add(id, vendor);
      };
    };
  };

  public shared ({ caller }) func deleteVendor(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete vendors");
    };
    vendors.remove(id);
  };

  public query func getVendor(id : Nat) : async Vendor {
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) { vendor };
    };
  };

  public query func getVendorsByCategory(category : VendorCategory) : async [Vendor] {
    vendors.values().toArray().filter(
      func(v) { v.category == category }
    );
  };

  public query func getAllVendors() : async [Vendor] {
    vendors.values().toArray();
  };

  // Product CRUD
  public shared ({ caller }) func createProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let id = nextProductId;
    nextProductId += 1;
    let newProduct = { product with id };
    products.add(id, newProduct);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.add(id, product);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  public query func getProductsByVendor(vendorId : Nat) : async [Product] {
    products.values().toArray().filter(
      func(p) { p.vendorId == vendorId }
    );
  };

  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Order Functions
  public shared ({ caller }) func createOrder(order : Order, items : [OrderItem]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let id = nextOrderId;
    nextOrderId += 1;
    let newOrder = { order with id; customerId = caller };
    orders.add(id, newOrder);
    orderItems.add(id, items);
    id;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func assignDriver(orderId : Nat, driverId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign drivers");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with driverId = ?driverId };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrdersByCustomer(customerId : Principal) : async [Order] {
    if (caller != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(
      func(o) { o.customerId == customerId }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getOrderItems(orderId : Nat) : async [OrderItem] {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own order items");
        };
        switch (orderItems.get(orderId)) {
          case (null) { [] };
          case (?items) { items };
        };
      };
    };
  };

  // Initial Data
  public shared ({ caller }) func initializeData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize data");
    };

    // --- Vendors ---
    let vendor1 : Vendor = {
      id = 1;
      name = "Nayakanahatti Temple";
      category = #temple;
      description = "Temple offerings and services";
      address = "Temple Road, Nayakanahatti";
      status = #open;
      isEcoDelivery = true;
    };
    let vendor2 : Vendor = {
      id = 2;
      name = "Annapurna Restaurant";
      category = #restaurant;
      description = "Vegetarian restaurant with fresh daily meals";
      address = "Main Street, Nayakanahatti";
      status = #open;
      isEcoDelivery = false;
    };
    let vendor3 : Vendor = {
      id = 3;
      name = "Lakshmi Grocery";
      category = #grocery;
      description = "Fresh groceries and daily essentials";
      address = "Market Road, Nayakanahatti";
      status = #open;
      isEcoDelivery = true;
    };
    let vendor4 : Vendor = {
      id = 4;
      name = "Health Pharmacy";
      category = #pharmacy;
      description = "Medicines and healthcare products";
      address = "Hospital Road, Nayakanahatti";
      status = #open;
      isEcoDelivery = false;
    };
    let vendor5 : Vendor = {
      id = 5;
      name = "Nayakanahatti Kirana Store";
      category = #grocery;
      description = "Your neighbourhood kirana store — staples, snacks, oil, and fresh daily supplies";
      address = "Bus Stand Road, Nayakanahatti";
      status = #open;
      isEcoDelivery = true;
    };
    let vendor6 : Vendor = {
      id = 6;
      name = "Sri Guru Thipperudra Swamy Prasada Store";
      category = #temple;
      description = "Authentic Nayakanahatti temple prasada, sacred flowers, vibhuti, kumkum and puja samagri";
      address = "Temple Entrance, Nayakanahatti";
      status = #open;
      isEcoDelivery = true;
    };

    vendors.add(1, vendor1);
    vendors.add(2, vendor2);
    vendors.add(3, vendor3);
    vendors.add(4, vendor4);
    vendors.add(5, vendor5);
    vendors.add(6, vendor6);
    nextVendorId := 7;

    // --- Products ---
    let product1 : Product = { id = 1; name = "Pooja Thali"; vendorId = 1; price = 100; category = #pooja; stockStatus = #inStock; description = "Complete pooja essentials" };
    let product2 : Product = { id = 2; name = "Incense Sticks"; vendorId = 1; price = 50; category = #pooja; stockStatus = #inStock; description = "Fragrant incense sticks" };
    let product3 : Product = { id = 3; name = "Camphor"; vendorId = 1; price = 30; category = #pooja; stockStatus = #inStock; description = "Pure camphor for aarti" };
    let product4 : Product = { id = 4; name = "Masala Dosa"; vendorId = 2; price = 60; category = #food; stockStatus = #inStock; description = "Crispy dosa with potato filling" };
    let product5 : Product = { id = 5; name = "Idli Vada"; vendorId = 2; price = 50; category = #food; stockStatus = #inStock; description = "Soft idlis with crispy vada" };
    let product6 : Product = { id = 6; name = "Filter Coffee"; vendorId = 2; price = 25; category = #food; stockStatus = #inStock; description = "Traditional south Indian coffee" };
    let product7 : Product = { id = 7; name = "Rice"; vendorId = 3; price = 500; category = #grocery; stockStatus = #inStock; description = "Premium quality rice 5kg" };
    let product8 : Product = { id = 8; name = "Dal"; vendorId = 3; price = 150; category = #grocery; stockStatus = #inStock; description = "Toor dal 1kg" };
    let product9 : Product = { id = 9; name = "Vegetables"; vendorId = 3; price = 100; category = #grocery; stockStatus = #inStock; description = "Fresh mixed vegetables" };
    let product10 : Product = { id = 10; name = "Paracetamol"; vendorId = 4; price = 20; category = #medicine; stockStatus = #inStock; description = "Pain relief tablets" };
    let product11 : Product = { id = 11; name = "Cough Syrup"; vendorId = 4; price = 80; category = #medicine; stockStatus = #inStock; description = "Cough relief syrup" };
    let product12 : Product = { id = 12; name = "First Aid Kit"; vendorId = 4; price = 250; category = #medicine; stockStatus = #inStock; description = "Complete first aid kit" };
    let product13 : Product = { id = 13; name = "Milk (500ml)"; vendorId = 5; price = 30; category = #grocery; stockStatus = #inStock; description = "Fresh full-cream milk, 500ml packet" };
    let product14 : Product = { id = 14; name = "Sunflower Oil (1L)"; vendorId = 5; price = 160; category = #grocery; stockStatus = #inStock; description = "Refined sunflower cooking oil, 1 litre" };
    let product15 : Product = { id = 15; name = "Sugar (1kg)"; vendorId = 5; price = 50; category = #grocery; stockStatus = #inStock; description = "White sugar, 1kg pack" };
    let product16 : Product = { id = 16; name = "Wheat Atta (5kg)"; vendorId = 5; price = 280; category = #grocery; stockStatus = #inStock; description = "Whole wheat flour, 5kg bag" };
    let product17 : Product = { id = 17; name = "Biscuits (Parle-G)"; vendorId = 5; price = 10; category = #grocery; stockStatus = #inStock; description = "Classic Parle-G glucose biscuits" };
    let product18 : Product = { id = 18; name = "Temple Prasada Pack"; vendorId = 6; price = 50; category = #pooja; stockStatus = #inStock; description = "Authentic prasada from Sri Guru Thipperudra Swamy Temple, Nayakanahatti" };
    let product19 : Product = { id = 19; name = "Vibhuti (Sacred Ash)"; vendorId = 6; price = 20; category = #pooja; stockStatus = #inStock; description = "Pure vibhuti blessed at the temple" };
    let product20 : Product = { id = 20; name = "Kumkum & Turmeric Set"; vendorId = 6; price = 40; category = #pooja; stockStatus = #inStock; description = "Sacred kumkum and turmeric for puja rituals" };
    let product21 : Product = { id = 21; name = "Flower Garland (Fresh)"; vendorId = 6; price = 60; category = #pooja; stockStatus = #inStock; description = "Fresh marigold and jasmine garland for temple offerings" };
    let product22 : Product = { id = 22; name = "Dry Coconut (Copra)"; vendorId = 6; price = 35; category = #pooja; stockStatus = #inStock; description = "Sacred dry coconut (copra) for vow fulfilment offerings" };

    products.add(1, product1);
    products.add(2, product2);
    products.add(3, product3);
    products.add(4, product4);
    products.add(5, product5);
    products.add(6, product6);
    products.add(7, product7);
    products.add(8, product8);
    products.add(9, product9);
    products.add(10, product10);
    products.add(11, product11);
    products.add(12, product12);
    products.add(13, product13);
    products.add(14, product14);
    products.add(15, product15);
    products.add(16, product16);
    products.add(17, product17);
    products.add(18, product18);
    products.add(19, product19);
    products.add(20, product20);
    products.add(21, product21);
    products.add(22, product22);
    nextProductId := 23;
  };
};
