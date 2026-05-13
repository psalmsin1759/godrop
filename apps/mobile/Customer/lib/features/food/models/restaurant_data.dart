import 'package:flutter/material.dart';
import '../../../app/theme.dart';

enum PartnerType { restaurant, grocery, retail, pharmacy }

extension PartnerTypeX on PartnerType {
  String get label {
    switch (this) {
      case PartnerType.restaurant: return 'Restaurant';
      case PartnerType.grocery:    return 'Grocery';
      case PartnerType.retail:     return 'Retail';
      case PartnerType.pharmacy:   return 'Pharmacy';
    }
  }

  IconData get icon {
    switch (this) {
      case PartnerType.restaurant: return Icons.restaurant_rounded;
      case PartnerType.grocery:    return Icons.shopping_basket_rounded;
      case PartnerType.retail:     return Icons.storefront_rounded;
      case PartnerType.pharmacy:   return Icons.medication_rounded;
    }
  }

  Color get color {
    switch (this) {
      case PartnerType.restaurant: return GodropColors.orange;
      case PartnerType.grocery:    return const Color(0xFF0EA5E9);
      case PartnerType.retail:     return const Color(0xFF8B5CF6);
      case PartnerType.pharmacy:   return const Color(0xFF10B981);
    }
  }

  String get orderTypeKey {
    switch (this) {
      case PartnerType.restaurant: return 'food';
      case PartnerType.grocery:    return 'grocery';
      case PartnerType.retail:     return 'retail';
      case PartnerType.pharmacy:   return 'pharmacy';
    }
  }

  List<String> get filters {
    switch (this) {
      case PartnerType.restaurant: return ['All', 'Nigerian', 'Fast Food', 'Grills', 'Shawarma', 'Continental'];
      case PartnerType.grocery:    return ['All', 'Fresh Produce', 'Dairy', 'Beverages', 'Snacks', 'Bakery'];
      case PartnerType.retail:     return ['All', 'Fashion', 'Electronics', 'Beauty', 'Home', 'Sports'];
      case PartnerType.pharmacy:   return ['All', 'Medications', 'Vitamins', 'Baby', 'Health', 'Personal Care'];
    }
  }

  String get searchHint {
    switch (this) {
      case PartnerType.restaurant: return 'Search restaurants or food...';
      case PartnerType.grocery:    return 'Search groceries or stores...';
      case PartnerType.retail:     return 'Search products or stores...';
      case PartnerType.pharmacy:   return 'Search medications or stores...';
    }
  }

  String get listTitle {
    switch (this) {
      case PartnerType.restaurant: return 'What are you ';
      case PartnerType.grocery:    return 'Fresh to your door, ';
      case PartnerType.retail:     return 'Shop the best ';
      case PartnerType.pharmacy:   return 'Your health, ';
    }
  }

  String get listTitleAccent {
    switch (this) {
      case PartnerType.restaurant: return 'craving?';
      case PartnerType.grocery:    return 'in under 2 hrs.';
      case PartnerType.retail:     return 'stores in Lagos.';
      case PartnerType.pharmacy:   return 'delivered fast.';
    }
  }

  String get emptyText {
    switch (this) {
      case PartnerType.restaurant: return 'No restaurants found';
      case PartnerType.grocery:    return 'No grocery stores found';
      case PartnerType.retail:     return 'No retail stores found';
      case PartnerType.pharmacy:   return 'No pharmacies found';
    }
  }

  String get listRoute {
    switch (this) {
      case PartnerType.restaurant: return '/food/restaurants';
      case PartnerType.grocery:    return '/grocery/stores';
      case PartnerType.retail:     return '/retail/stores';
      case PartnerType.pharmacy:   return '/pharmacy/stores';
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

class MenuItemData {
  final String id;
  final String name;
  final String desc;
  final int priceKobo;
  final String emoji;
  const MenuItemData({
    required this.id,
    required this.name,
    required this.desc,
    required this.priceKobo,
    required this.emoji,
  });
}

class MenuCategoryData {
  final String name;
  final List<MenuItemData> items;
  const MenuCategoryData({required this.name, required this.items});
}

class PartnerData {
  final String id;
  final String name;
  final String type;
  final String area;
  final double rating;
  final String deliveryTime;
  final int deliveryFeeKobo;
  final String? tag;
  final Color? tagColor;
  final List<String> cuisines;
  final List<MenuCategoryData> menuCategories;
  final PartnerType partnerType;

  const PartnerData({
    required this.id,
    required this.name,
    required this.type,
    required this.area,
    required this.rating,
    required this.deliveryTime,
    required this.deliveryFeeKobo,
    this.tag,
    this.tagColor,
    required this.cuisines,
    required this.menuCategories,
    this.partnerType = PartnerType.restaurant,
  });
}

// Backwards-compat alias used by cart_checkout_screen
typedef RestaurantData = PartnerData;

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANTS (7)
// ─────────────────────────────────────────────────────────────────────────────

const kNigerianRestaurants = <PartnerData>[
  PartnerData(
    id: 'the-place',
    name: 'The Place Restaurant',
    type: 'Nigerian · Continental',
    area: 'Lekki Phase 1',
    rating: 4.8,
    deliveryTime: '25–30 min',
    deliveryFeeKobo: 0,
    tag: 'Free delivery',
    tagColor: GodropColors.success,
    cuisines: ['Nigerian', 'Continental'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'tp-p1', name: 'Jollof Rice + Chicken', desc: 'Smoky party jollof with grilled chicken thigh', priceKobo: 350000, emoji: '🍛'),
        MenuItemData(id: 'tp-p2', name: 'Pounded Yam & Egusi', desc: 'Fresh pounded yam with egusi, assorted meat & stockfish', priceKobo: 420000, emoji: '🥣'),
        MenuItemData(id: 'tp-p3', name: 'Grilled Tilapia', desc: 'Whole grilled tilapia with spiced tomato sauce & plantain', priceKobo: 550000, emoji: '🐟'),
        MenuItemData(id: 'tp-p4', name: 'Suya Platter', desc: 'Mixed suya — beef, chicken & kidney with yaji spice', priceKobo: 580000, emoji: '🥩'),
      ]),
      MenuCategoryData(name: 'Rice Dishes', items: [
        MenuItemData(id: 'tp-r1', name: 'Party Jollof Rice', desc: 'Served with coleslaw & fried plantain', priceKobo: 300000, emoji: '🍛'),
        MenuItemData(id: 'tp-r2', name: 'Fried Rice + Liver', desc: 'Vegetable fried rice with spiced chicken liver', priceKobo: 280000, emoji: '🍚'),
        MenuItemData(id: 'tp-r3', name: 'Coconut Rice + Chicken', desc: 'Aromatic coconut rice with grilled chicken', priceKobo: 320000, emoji: '🍚'),
        MenuItemData(id: 'tp-r4', name: 'White Rice & Buka Stew', desc: 'Steamed long-grain rice with rich tomato-beef stew', priceKobo: 250000, emoji: '🍚'),
      ]),
      MenuCategoryData(name: 'Swallow & Soups', items: [
        MenuItemData(id: 'tp-s1', name: 'Pounded Yam & Egusi', desc: 'Assorted meat & stockfish', priceKobo: 420000, emoji: '🥣'),
        MenuItemData(id: 'tp-s2', name: 'Eba & Okra Soup', desc: 'Okra drawn with fresh fish and assorted meat', priceKobo: 350000, emoji: '🥣'),
        MenuItemData(id: 'tp-s3', name: 'Amala & Ewedu', desc: 'With gbegiri and fried beef', priceKobo: 380000, emoji: '🥣'),
        MenuItemData(id: 'tp-s4', name: 'Fufu & Banga Soup', desc: 'Soft fufu with Delta-style palm nut soup', priceKobo: 450000, emoji: '🥣'),
      ]),
      MenuCategoryData(name: 'Grills', items: [
        MenuItemData(id: 'tp-g1', name: 'Grilled Chicken (whole)', desc: 'Marinated & slow-grilled with peri-peri sauce', priceKobo: 650000, emoji: '🍗'),
        MenuItemData(id: 'tp-g2', name: 'Grilled Tilapia', desc: 'Whole fish, charcoal-grilled with spiced sauce', priceKobo: 550000, emoji: '🐟'),
        MenuItemData(id: 'tp-g3', name: 'Peppered Gizzard', desc: 'Crispy gizzard in rich pepper sauce', priceKobo: 280000, emoji: '🍖'),
        MenuItemData(id: 'tp-g4', name: 'Mixed Grill Platter', desc: 'Chicken, beef & turkey — serves 2', priceKobo: 850000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'tp-d1', name: 'Chapman', desc: 'Chilled Nigerian classic cocktail', priceKobo: 120000, emoji: '🍹'),
        MenuItemData(id: 'tp-d2', name: 'Zobo (cold)', desc: 'Hibiscus drink with ginger & pineapple', priceKobo: 80000, emoji: '🍵'),
        MenuItemData(id: 'tp-d3', name: 'Kunu', desc: 'Millet-based spiced drink, chilled', priceKobo: 70000, emoji: '🥤'),
        MenuItemData(id: 'tp-d4', name: 'Malt (can)', desc: 'Supermalt or Maltina', priceKobo: 50000, emoji: '🍺'),
      ]),
    ],
  ),

  PartnerData(
    id: 'chicken-republic',
    name: 'Chicken Republic',
    type: 'Fast Food',
    area: 'Victoria Island',
    rating: 4.6,
    deliveryTime: '15–20 min',
    deliveryFeeKobo: 35000,
    tag: '30% off',
    tagColor: GodropColors.orange,
    cuisines: ['Fast Food', 'Nigerian'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'cr-p1', name: 'Mega Chicken Meal', desc: 'Mega chicken + large chips + drink', priceKobo: 380000, emoji: '🍗'),
        MenuItemData(id: 'cr-p2', name: 'Spicy Chicken Burger', desc: 'Juicy spicy chicken fillet in toasted bun', priceKobo: 280000, emoji: '🍔'),
        MenuItemData(id: 'cr-p3', name: 'Chicken Wrap', desc: 'Grilled chicken strips wrapped in warm tortilla', priceKobo: 220000, emoji: '🌯'),
        MenuItemData(id: 'cr-p4', name: 'Spicy Wings (6 pcs)', desc: 'Crispy spiced chicken wings', priceKobo: 280000, emoji: '🍗'),
      ]),
      MenuCategoryData(name: 'Chicken', items: [
        MenuItemData(id: 'cr-c1', name: 'Mega Chicken (1 pc)', desc: 'Signature large-sized fried chicken', priceKobo: 180000, emoji: '🍗'),
        MenuItemData(id: 'cr-c2', name: 'Chicken Strips (5 pcs)', desc: 'Crispy chicken breast strips', priceKobo: 250000, emoji: '🍗'),
        MenuItemData(id: 'cr-c3', name: 'Spicy Wings (6 pcs)', desc: 'Fire-hot seasoned wings', priceKobo: 280000, emoji: '🍗'),
        MenuItemData(id: 'cr-c4', name: 'Whole Roasted Chicken', desc: 'Full oven-roasted chicken with herbs', priceKobo: 850000, emoji: '🍗'),
      ]),
      MenuCategoryData(name: 'Burgers & Wraps', items: [
        MenuItemData(id: 'cr-b1', name: 'Spicy Chicken Burger', desc: 'Crispy chicken in brioche bun with spicy mayo', priceKobo: 280000, emoji: '🍔'),
        MenuItemData(id: 'cr-b2', name: 'Double Beef Burger', desc: 'Two beef patties with cheese & pickles', priceKobo: 320000, emoji: '🍔'),
        MenuItemData(id: 'cr-b3', name: 'Chicken Wrap', desc: 'Grilled chicken, lettuce, tomato, garlic sauce', priceKobo: 220000, emoji: '🌯'),
        MenuItemData(id: 'cr-b4', name: 'Shawarma Wrap', desc: 'Chicken shawarma with coleslaw & sauce', priceKobo: 250000, emoji: '🌯'),
      ]),
      MenuCategoryData(name: 'Sides', items: [
        MenuItemData(id: 'cr-s1', name: 'Small Chips', desc: 'Golden fried potato chips', priceKobo: 70000, emoji: '🍟'),
        MenuItemData(id: 'cr-s2', name: 'Large Chips', desc: 'Double-sized golden chips', priceKobo: 110000, emoji: '🍟'),
        MenuItemData(id: 'cr-s3', name: 'Coleslaw', desc: 'Fresh creamy coleslaw', priceKobo: 50000, emoji: '🥗'),
        MenuItemData(id: 'cr-s4', name: 'Chicken Fried Rice', desc: 'Seasoned fried rice with chicken bits', priceKobo: 150000, emoji: '🍚'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'cr-d1', name: 'Pepsi (500ml)', desc: 'Ice-cold Pepsi', priceKobo: 40000, emoji: '🥤'),
        MenuItemData(id: 'cr-d2', name: 'Bottled Water', desc: 'Pure Life 75cl', priceKobo: 20000, emoji: '💧'),
        MenuItemData(id: 'cr-d3', name: 'Chivita Juice', desc: 'Mixed fruit juice, chilled', priceKobo: 60000, emoji: '🧃'),
        MenuItemData(id: 'cr-d4', name: 'Ribena (small)', desc: 'Blackcurrant drink', priceKobo: 50000, emoji: '🧃'),
      ]),
    ],
  ),

  PartnerData(
    id: 'bukka-hut',
    name: 'Bukka Hut',
    type: 'Nigerian · Buffet',
    area: 'Ikeja',
    rating: 4.5,
    deliveryTime: '30–40 min',
    deliveryFeeKobo: 50000,
    cuisines: ['Nigerian'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'bh-p1', name: 'Pounded Yam & Ofe Onugbu', desc: 'Fresh pounded yam with bitter leaf soup & assorted meat', priceKobo: 450000, emoji: '🥣'),
        MenuItemData(id: 'bh-p2', name: 'Ofada Rice & Stew', desc: 'Local rice with ayamase sauce & assorted', priceKobo: 320000, emoji: '🍚'),
        MenuItemData(id: 'bh-p3', name: 'Assorted Pepper Soup', desc: 'Mixed meats in hot spicy broth', priceKobo: 350000, emoji: '🥘'),
        MenuItemData(id: 'bh-p4', name: 'Goat Meat', desc: 'Peppered goat meat, well-seasoned', priceKobo: 250000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Soups', items: [
        MenuItemData(id: 'bh-s1', name: 'Ofe Onugbu (Bitter Leaf)', desc: 'Slow-cooked with crayfish & assorted meat', priceKobo: 450000, emoji: '🥣'),
        MenuItemData(id: 'bh-s2', name: 'Oha Soup', desc: 'Ibo delicacy with uziza & cocoyam', priceKobo: 480000, emoji: '🥣'),
        MenuItemData(id: 'bh-s3', name: 'Egusi Soup', desc: 'Ground melon seed with leafy vegetables', priceKobo: 420000, emoji: '🥣'),
        MenuItemData(id: 'bh-s4', name: 'Banga Soup', desc: 'Palm nut soup, Delta style', priceKobo: 500000, emoji: '🥣'),
      ]),
      MenuCategoryData(name: 'Rice & Stews', items: [
        MenuItemData(id: 'bh-r1', name: 'Ofada Rice & Stew', desc: 'Local brown rice with ayamase sauce', priceKobo: 320000, emoji: '🍚'),
        MenuItemData(id: 'bh-r2', name: 'White Rice & Buka Stew', desc: 'Rich tomato-pepper stew with beef', priceKobo: 280000, emoji: '🍚'),
        MenuItemData(id: 'bh-r3', name: 'Jollof Rice', desc: 'Party-style jollof with assorted proteins', priceKobo: 300000, emoji: '🍛'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'bh-d1', name: 'Palm Wine', desc: 'Fresh tapped, lightly sweet', priceKobo: 80000, emoji: '🍷'),
        MenuItemData(id: 'bh-d2', name: 'Zobo', desc: 'Chilled hibiscus drink', priceKobo: 60000, emoji: '🍵'),
        MenuItemData(id: 'bh-d3', name: 'Maltina', desc: 'Non-alcoholic malt drink, chilled', priceKobo: 50000, emoji: '🍺'),
      ]),
    ],
  ),

  PartnerData(
    id: 'suya-spot',
    name: 'Suya Spot Lagos',
    type: 'Grills · BBQ',
    area: 'Yaba',
    rating: 4.7,
    deliveryTime: '20–25 min',
    deliveryFeeKobo: 40000,
    cuisines: ['Grills', 'Nigerian'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'ss-p1', name: 'Beef Suya (500g)', desc: 'Classic Hausa-style spiced beef suya with yaji', priceKobo: 580000, emoji: '🥩'),
        MenuItemData(id: 'ss-p2', name: 'Chicken Suya (whole)', desc: 'Spatchcocked chicken marinated in suya spice', priceKobo: 450000, emoji: '🍗'),
        MenuItemData(id: 'ss-p3', name: 'Kidney & Offal Suya', desc: 'Mixed kidneys, liver & gizzard on skewers', priceKobo: 300000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Beef Suya', items: [
        MenuItemData(id: 'ss-b1', name: 'Beef Suya (250g)', desc: 'Small portion, thinly sliced sirloin', priceKobo: 300000, emoji: '🥩'),
        MenuItemData(id: 'ss-b2', name: 'Beef Suya (500g)', desc: 'Standard portion with yaji & fresh onions', priceKobo: 580000, emoji: '🥩'),
        MenuItemData(id: 'ss-b3', name: 'Beef Suya (1kg)', desc: 'Party-size serving', priceKobo: 1100000, emoji: '🥩'),
        MenuItemData(id: 'ss-b4', name: 'Kilishi (dried suya)', desc: 'Sun-dried spiced beef strips', priceKobo: 350000, emoji: '🥩'),
      ]),
      MenuCategoryData(name: 'Chicken', items: [
        MenuItemData(id: 'ss-c1', name: 'Chicken Suya (half)', desc: 'Half chicken marinated in yaji spice', priceKobo: 250000, emoji: '🍗'),
        MenuItemData(id: 'ss-c2', name: 'Chicken Suya (whole)', desc: 'Whole spatchcock chicken, charcoal-grilled', priceKobo: 450000, emoji: '🍗'),
        MenuItemData(id: 'ss-c3', name: 'Chicken Wings Suya (6 pcs)', desc: 'Spiced wings straight off the grill', priceKobo: 320000, emoji: '🍗'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'ss-d1', name: 'Star Beer (bottle)', desc: 'Cold lager, Nigerian favourite', priceKobo: 90000, emoji: '🍺'),
        MenuItemData(id: 'ss-d2', name: 'Soft Drink', desc: 'Pepsi, Fanta or Sprite', priceKobo: 40000, emoji: '🥤'),
        MenuItemData(id: 'ss-d3', name: 'Water', desc: 'Pure Life 75cl', priceKobo: 20000, emoji: '💧'),
      ]),
    ],
  ),

  PartnerData(
    id: 'shawarma-planet',
    name: 'Shawarma Planet',
    type: 'Middle Eastern · Street Food',
    area: 'Lekki Phase 1',
    rating: 4.4,
    deliveryTime: '20–30 min',
    deliveryFeeKobo: 30000,
    tag: 'NEW',
    tagColor: GodropColors.blue,
    cuisines: ['Shawarma'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'sp-p1', name: 'Mega Chicken Shawarma', desc: 'XL chicken wrap with garlic sauce & pickled veggies', priceKobo: 320000, emoji: '🌯'),
        MenuItemData(id: 'sp-p2', name: 'Beef & Cheese Shawarma', desc: 'Marinated beef with melted cheese in flatbread', priceKobo: 350000, emoji: '🌯'),
        MenuItemData(id: 'sp-p3', name: 'Loaded Burger', desc: 'Double patty with bacon, cheese & special sauce', priceKobo: 280000, emoji: '🍔'),
      ]),
      MenuCategoryData(name: 'Shawarma', items: [
        MenuItemData(id: 'sp-s1', name: 'Regular Chicken Shawarma', desc: 'Classic chicken with coleslaw & garlic sauce', priceKobo: 220000, emoji: '🌯'),
        MenuItemData(id: 'sp-s2', name: 'Mega Chicken Shawarma', desc: 'XL portion, extra fillings', priceKobo: 320000, emoji: '🌯'),
        MenuItemData(id: 'sp-s3', name: 'Beef Shawarma', desc: 'Spiced beef strips in warm flatbread', priceKobo: 280000, emoji: '🌯'),
        MenuItemData(id: 'sp-s4', name: 'Mixed Shawarma (XL)', desc: 'Beef + chicken, super-loaded XL wrap', priceKobo: 450000, emoji: '🌯'),
      ]),
      MenuCategoryData(name: 'Burgers', items: [
        MenuItemData(id: 'sp-b1', name: 'Classic Beef Burger', desc: 'Single beef patty with lettuce & tomato', priceKobo: 220000, emoji: '🍔'),
        MenuItemData(id: 'sp-b2', name: 'Loaded Burger', desc: 'Double patty, bacon, cheese & jalapeños', priceKobo: 280000, emoji: '🍔'),
      ]),
      MenuCategoryData(name: 'Sides', items: [
        MenuItemData(id: 'sp-si1', name: 'French Fries', desc: 'Golden crispy seasoned fries', priceKobo: 80000, emoji: '🍟'),
        MenuItemData(id: 'sp-si2', name: 'Onion Rings', desc: 'Beer-battered crispy onion rings', priceKobo: 90000, emoji: '🧅'),
        MenuItemData(id: 'sp-si3', name: 'Coleslaw', desc: 'House creamy coleslaw', priceKobo: 50000, emoji: '🥗'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'sp-d1', name: 'Mango Smoothie', desc: 'Fresh blended mango, chilled', priceKobo: 150000, emoji: '🥭'),
        MenuItemData(id: 'sp-d2', name: 'Pepsi (500ml)', desc: 'Ice cold', priceKobo: 40000, emoji: '🥤'),
        MenuItemData(id: 'sp-d3', name: 'Malta Guinness', desc: 'Energy-packed non-alcoholic malt', priceKobo: 60000, emoji: '🍺'),
      ]),
    ],
  ),

  PartnerData(
    id: 'mr-biggs',
    name: 'Mr. Biggs',
    type: 'Fast Food · Nigerian',
    area: 'Victoria Island',
    rating: 4.3,
    deliveryTime: '25–35 min',
    deliveryFeeKobo: 25000,
    cuisines: ['Fast Food', 'Nigerian'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'mb-p1', name: 'Meat Pie (2 pcs)', desc: 'Buttery pastry filled with spiced beef & potatoes', priceKobo: 140000, emoji: '🥧'),
        MenuItemData(id: 'mb-p2', name: 'Chicken & Chips', desc: 'Fried chicken with golden potato chips', priceKobo: 280000, emoji: '🍗'),
        MenuItemData(id: 'mb-p3', name: 'Jollof Rice + Chicken', desc: 'Party jollof with fried chicken', priceKobo: 250000, emoji: '🍛'),
        MenuItemData(id: 'mb-p4', name: 'Doughnut (3 pcs)', desc: 'Freshly fried ring doughnuts', priceKobo: 90000, emoji: '🍩'),
      ]),
      MenuCategoryData(name: 'Pastries', items: [
        MenuItemData(id: 'mb-pa1', name: 'Meat Pie', desc: 'Classic spiced beef & potato filling', priceKobo: 70000, emoji: '🥧'),
        MenuItemData(id: 'mb-pa2', name: 'Fish Pie', desc: 'Flaky pastry with seasoned fish filling', priceKobo: 70000, emoji: '🥧'),
        MenuItemData(id: 'mb-pa3', name: 'Sausage Roll', desc: 'Puff pastry wrapped around pork sausage', priceKobo: 50000, emoji: '🌭'),
        MenuItemData(id: 'mb-pa4', name: 'Puff Puff (6 pcs)', desc: 'Fried dough balls, sweet & pillowy', priceKobo: 80000, emoji: '🍩'),
      ]),
      MenuCategoryData(name: 'Rice & Meals', items: [
        MenuItemData(id: 'mb-r1', name: 'Jollof Rice + Chicken', desc: 'Signature jollof with fried chicken piece', priceKobo: 250000, emoji: '🍛'),
        MenuItemData(id: 'mb-r2', name: 'Fried Rice + Liver', desc: 'Vegetable fried rice with spiced liver', priceKobo: 250000, emoji: '🍚'),
        MenuItemData(id: 'mb-r3', name: 'Noodles & Egg', desc: 'Indomie noodles fried with eggs & veggies', priceKobo: 150000, emoji: '🍜'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'mb-d1', name: 'Chivita Juice', desc: 'Mixed fruit juice box, chilled', priceKobo: 60000, emoji: '🧃'),
        MenuItemData(id: 'mb-d2', name: 'Pepsi Can', desc: 'Ice-cold Pepsi 33cl can', priceKobo: 40000, emoji: '🥤'),
        MenuItemData(id: 'mb-d3', name: 'Nestle Water', desc: 'Still water 75cl', priceKobo: 20000, emoji: '💧'),
      ]),
    ],
  ),

  PartnerData(
    id: 'yellow-chilli',
    name: 'Yellow Chilli',
    type: 'Nigerian Continental · Fine Dining',
    area: 'Ikoyi',
    rating: 4.9,
    deliveryTime: '30–45 min',
    deliveryFeeKobo: 60000,
    tag: 'PREMIUM',
    tagColor: Color(0xFF7C3AED),
    cuisines: ['Nigerian', 'Continental'],
    partnerType: PartnerType.restaurant,
    menuCategories: [
      MenuCategoryData(name: 'Popular', items: [
        MenuItemData(id: 'yc-p1', name: 'Nkwobi', desc: 'Cow leg in spiced palm oil & uziza, premium cut', priceKobo: 450000, emoji: '🍖'),
        MenuItemData(id: 'yc-p2', name: 'Seafood Okra Soup', desc: 'Drawn okra with prawns, crab & lobster', priceKobo: 650000, emoji: '🦞'),
        MenuItemData(id: 'yc-p3', name: 'Grilled Salmon', desc: 'Norwegian salmon with roasted vegetables & lemon butter', priceKobo: 880000, emoji: '🐟'),
        MenuItemData(id: 'yc-p4', name: 'BBQ Lamb Ribs', desc: 'Slow-cooked baby ribs with chimichurri', priceKobo: 1250000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Starters', items: [
        MenuItemData(id: 'yc-st1', name: 'Nkwobi', desc: 'Classic Igbo delicacy — cow leg in palm oil sauce', priceKobo: 450000, emoji: '🍖'),
        MenuItemData(id: 'yc-st2', name: 'Peppered Snail', desc: 'Jumbo snails in rich pepper sauce', priceKobo: 380000, emoji: '🐌'),
        MenuItemData(id: 'yc-st3', name: 'Catfish Pepper Soup', desc: 'Whole point-and-kill catfish, spiced broth', priceKobo: 520000, emoji: '🐟'),
      ]),
      MenuCategoryData(name: 'Nigerian Mains', items: [
        MenuItemData(id: 'yc-n1', name: 'Seafood Okra Soup', desc: 'With lobster, crab, prawns & assorted fish', priceKobo: 650000, emoji: '🦞'),
        MenuItemData(id: 'yc-n2', name: 'Banga Soup (large)', desc: 'Delta-style palm nut soup, serves 2', priceKobo: 580000, emoji: '🥣'),
        MenuItemData(id: 'yc-n3', name: 'Goat Meat Peppersoup', desc: 'Whole chunks in fragrant spiced broth', priceKobo: 420000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Continental', items: [
        MenuItemData(id: 'yc-c1', name: 'Grilled Salmon + Vegetables', desc: 'Norwegian salmon, seasonal vegs & lemon butter', priceKobo: 880000, emoji: '🐟'),
        MenuItemData(id: 'yc-c2', name: 'Pasta Carbonara', desc: 'Spaghetti in creamy egg sauce with crispy lardons', priceKobo: 550000, emoji: '🍝'),
        MenuItemData(id: 'yc-c3', name: 'BBQ Lamb Ribs', desc: 'Baby ribs, 6-hour smoke, served with chimichurri', priceKobo: 1250000, emoji: '🍖'),
      ]),
      MenuCategoryData(name: 'Drinks', items: [
        MenuItemData(id: 'yc-d1', name: 'Zobo & Ginger (premium)', desc: 'House recipe with citrus & spice', priceKobo: 150000, emoji: '🍵'),
        MenuItemData(id: 'yc-d2', name: 'Chapman (signature)', desc: 'Upgraded Chapman with fresh fruit garnish', priceKobo: 200000, emoji: '🍹'),
        MenuItemData(id: 'yc-d3', name: 'House Red Wine (glass)', desc: 'Imported table wine', priceKobo: 450000, emoji: '🍷'),
      ]),
    ],
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// GROCERY STORES (3)
// ─────────────────────────────────────────────────────────────────────────────

const kGroceryPartners = <PartnerData>[
  PartnerData(
    id: 'shoprite',
    name: 'Shoprite Lagos',
    type: 'Supermarket · All items',
    area: 'Lekki Phase 1',
    rating: 4.6,
    deliveryTime: '45–60 min',
    deliveryFeeKobo: 50000,
    tag: 'Popular',
    tagColor: GodropColors.blue,
    cuisines: ['Fresh Produce', 'Dairy', 'Beverages', 'Snacks', 'Bakery'],
    partnerType: PartnerType.grocery,
    menuCategories: [
      MenuCategoryData(name: 'Fresh Produce', items: [
        MenuItemData(id: 'sh-fp1', name: 'Tomatoes (1kg)', desc: 'Fresh ripe tomatoes, locally sourced', priceKobo: 80000, emoji: '🍅'),
        MenuItemData(id: 'sh-fp2', name: 'Bell Peppers (pack)', desc: 'Mixed red, yellow & green peppers', priceKobo: 120000, emoji: '🫑'),
        MenuItemData(id: 'sh-fp3', name: 'Plantains (hand)', desc: 'Ripe plantains, ready to fry', priceKobo: 150000, emoji: '🍌'),
        MenuItemData(id: 'sh-fp4', name: 'Spring Onions (bunch)', desc: 'Fresh green onions for garnish', priceKobo: 60000, emoji: '🧅'),
        MenuItemData(id: 'sh-fp5', name: 'Cucumber (each)', desc: 'Crisp fresh cucumber', priceKobo: 40000, emoji: '🥒'),
        MenuItemData(id: 'sh-fp6', name: 'Watermelon (half)', desc: 'Sweet seedless watermelon, cut & wrapped', priceKobo: 250000, emoji: '🍉'),
      ]),
      MenuCategoryData(name: 'Dairy', items: [
        MenuItemData(id: 'sh-da1', name: 'Fresh Milk 1L', desc: 'Pasteurised whole milk, chilled', priceKobo: 80000, emoji: '🥛'),
        MenuItemData(id: 'sh-da2', name: 'Greek Yogurt 500g', desc: 'Plain full-fat Greek yogurt', priceKobo: 120000, emoji: '🥛'),
        MenuItemData(id: 'sh-da3', name: 'Butter 250g', desc: 'Unsalted dairy butter', priceKobo: 90000, emoji: '🧈'),
        MenuItemData(id: 'sh-da4', name: 'Eggs (12 pcs)', desc: 'Large grade-A free-range eggs', priceKobo: 150000, emoji: '🥚'),
        MenuItemData(id: 'sh-da5', name: 'Cheddar Cheese 200g', desc: 'Mild cheddar block, sliceable', priceKobo: 250000, emoji: '🧀'),
      ]),
      MenuCategoryData(name: 'Beverages', items: [
        MenuItemData(id: 'sh-bv1', name: 'Coca-Cola 50cl', desc: 'Classic Coke, chilled', priceKobo: 30000, emoji: '🥤'),
        MenuItemData(id: 'sh-bv2', name: 'Malta Guinness 33cl', desc: 'Non-alcoholic malt drink', priceKobo: 25000, emoji: '🍺'),
        MenuItemData(id: 'sh-bv3', name: 'Chi Juice 350ml', desc: 'Mixed fruit juice', priceKobo: 45000, emoji: '🧃'),
        MenuItemData(id: 'sh-bv4', name: 'Ribena 500ml', desc: 'Blackcurrant cordial drink', priceKobo: 60000, emoji: '🧃'),
        MenuItemData(id: 'sh-bv5', name: 'Eva Water 75cl', desc: 'Still mineral water', priceKobo: 20000, emoji: '💧'),
      ]),
      MenuCategoryData(name: 'Snacks', items: [
        MenuItemData(id: 'sh-sn1', name: 'Pringles Original', desc: 'Crispy potato crisps in a tube', priceKobo: 250000, emoji: '🍟'),
        MenuItemData(id: 'sh-sn2', name: 'Digestive Biscuits 400g', desc: 'McVitie\'s whole grain biscuits', priceKobo: 80000, emoji: '🍪'),
        MenuItemData(id: 'sh-sn3', name: 'Peanut Butter 340g', desc: 'Smooth roasted peanut butter', priceKobo: 180000, emoji: '🥜'),
        MenuItemData(id: 'sh-sn4', name: 'Cashews 200g', desc: 'Lightly salted roasted cashews', priceKobo: 200000, emoji: '🥜'),
        MenuItemData(id: 'sh-sn5', name: 'Chocolate Bar', desc: 'Kit Kat or Snickers, your choice', priceKobo: 50000, emoji: '🍫'),
      ]),
      MenuCategoryData(name: 'Bakery', items: [
        MenuItemData(id: 'sh-bk1', name: 'Sliced Bread (large)', desc: 'Soft white sandwich bread', priceKobo: 70000, emoji: '🍞'),
        MenuItemData(id: 'sh-bk2', name: 'Croissants (4 pcs)', desc: 'Buttery flaky croissants', priceKobo: 150000, emoji: '🥐'),
        MenuItemData(id: 'sh-bk3', name: 'Blueberry Muffins (4 pcs)', desc: 'Fresh-baked muffins, individually wrapped', priceKobo: 120000, emoji: '🧁'),
        MenuItemData(id: 'sh-bk4', name: 'Wheat Bread', desc: 'Whole wheat loaf, high fibre', priceKobo: 80000, emoji: '🍞'),
      ]),
    ],
  ),

  PartnerData(
    id: 'ebeano',
    name: 'Ebeano Supermarket',
    type: 'Premium Supermarket',
    area: 'Lekki Phase 1',
    rating: 4.7,
    deliveryTime: '40–55 min',
    deliveryFeeKobo: 0,
    tag: 'Free delivery',
    tagColor: GodropColors.success,
    cuisines: ['Fresh Produce', 'Dairy', 'Beverages', 'Snacks', 'Bakery'],
    partnerType: PartnerType.grocery,
    menuCategories: [
      MenuCategoryData(name: 'Fresh Produce', items: [
        MenuItemData(id: 'eb-fp1', name: 'Organic Tomatoes (1kg)', desc: 'Certified organic, vine-ripened', priceKobo: 120000, emoji: '🍅'),
        MenuItemData(id: 'eb-fp2', name: 'Baby Spinach (bag)', desc: 'Pre-washed baby spinach leaves', priceKobo: 180000, emoji: '🥬'),
        MenuItemData(id: 'eb-fp3', name: 'Avocado (each)', desc: 'Ripe Hass avocado, ready to eat', priceKobo: 100000, emoji: '🥑'),
        MenuItemData(id: 'eb-fp4', name: 'Sweet Corn (2 pcs)', desc: 'Fresh on-the-cob sweetcorn', priceKobo: 80000, emoji: '🌽'),
        MenuItemData(id: 'eb-fp5', name: 'Ginger (250g)', desc: 'Fresh local ginger root', priceKobo: 40000, emoji: '🫚'),
      ]),
      MenuCategoryData(name: 'Dairy', items: [
        MenuItemData(id: 'eb-da1', name: 'Skimmed Milk 1L', desc: 'Low-fat pasteurised skimmed milk', priceKobo: 90000, emoji: '🥛'),
        MenuItemData(id: 'eb-da2', name: 'Fruit Yogurt 200g', desc: 'Strawberry or mango flavour', priceKobo: 80000, emoji: '🥛'),
        MenuItemData(id: 'eb-da3', name: 'Salted Butter 250g', desc: 'Premium salted dairy butter', priceKobo: 100000, emoji: '🧈'),
        MenuItemData(id: 'eb-da4', name: 'Eggs (6 pcs)', desc: 'Medium grade eggs', priceKobo: 80000, emoji: '🥚'),
      ]),
      MenuCategoryData(name: 'Beverages', items: [
        MenuItemData(id: 'eb-bv1', name: 'Tropicana Orange 1L', desc: 'Pure squeezed orange juice, no sugar', priceKobo: 180000, emoji: '🍊'),
        MenuItemData(id: 'eb-bv2', name: 'Sprite 50cl', desc: 'Ice-cold Sprite', priceKobo: 30000, emoji: '🥤'),
        MenuItemData(id: 'eb-bv3', name: 'Nestea Iced Tea 500ml', desc: 'Lemon flavoured iced tea', priceKobo: 70000, emoji: '🧃'),
        MenuItemData(id: 'eb-bv4', name: 'Hollandia Yoghurt 250ml', desc: 'Strawberry drinkable yoghurt', priceKobo: 60000, emoji: '🥛'),
      ]),
      MenuCategoryData(name: 'Snacks', items: [
        MenuItemData(id: 'eb-sn1', name: 'Lay\'s Chips 150g', desc: 'Classic salted potato chips', priceKobo: 120000, emoji: '🍟'),
        MenuItemData(id: 'eb-sn2', name: 'Choco Milo 400g', desc: 'Chocolate malt cereal drink', priceKobo: 280000, emoji: '🍫'),
        MenuItemData(id: 'eb-sn3', name: 'Cabin Biscuits', desc: 'Classic plain cabin biscuits', priceKobo: 30000, emoji: '🍪'),
        MenuItemData(id: 'eb-sn4', name: 'Gala Sausage Roll', desc: 'UAC Gala snack sausage roll', priceKobo: 30000, emoji: '🌭'),
      ]),
      MenuCategoryData(name: 'Bakery', items: [
        MenuItemData(id: 'eb-bk1', name: 'Agege Bread', desc: 'Soft Nigerian-style white bread', priceKobo: 50000, emoji: '🍞'),
        MenuItemData(id: 'eb-bk2', name: 'Chin Chin (pack)', desc: 'Crispy fried snack, lightly sweetened', priceKobo: 80000, emoji: '🍩'),
        MenuItemData(id: 'eb-bk3', name: 'Small Chops (box)', desc: 'Puff puff, samosa & spring rolls', priceKobo: 200000, emoji: '🥟'),
      ]),
    ],
  ),

  PartnerData(
    id: 'justrite',
    name: 'Justrite Superstore',
    type: 'Superstore · Wholesale',
    area: 'Ikeja',
    rating: 4.4,
    deliveryTime: '50–70 min',
    deliveryFeeKobo: 35000,
    cuisines: ['Fresh Produce', 'Dairy', 'Beverages', 'Snacks'],
    partnerType: PartnerType.grocery,
    menuCategories: [
      MenuCategoryData(name: 'Fresh Produce', items: [
        MenuItemData(id: 'jr-fp1', name: 'Yam (tuber)', desc: 'Large white yam tuber, ~2kg', priceKobo: 180000, emoji: '🍠'),
        MenuItemData(id: 'jr-fp2', name: 'Sweet Potatoes (1kg)', desc: 'Fresh orange sweet potatoes', priceKobo: 70000, emoji: '🍠'),
        MenuItemData(id: 'jr-fp3', name: 'Plantains (bunch)', desc: 'Unripe plantains, 8–10 fingers', priceKobo: 200000, emoji: '🍌'),
        MenuItemData(id: 'jr-fp4', name: 'Garlic (3 bulbs)', desc: 'Local fresh garlic', priceKobo: 50000, emoji: '🧄'),
        MenuItemData(id: 'jr-fp5', name: 'Pepper Mix (500g)', desc: 'Blended fresh pepper, tatashe & scotch bonnet', priceKobo: 60000, emoji: '🌶️'),
      ]),
      MenuCategoryData(name: 'Dairy', items: [
        MenuItemData(id: 'jr-da1', name: 'Peak Milk (tin)', desc: 'Full cream evaporated milk 410g', priceKobo: 50000, emoji: '🥛'),
        MenuItemData(id: 'jr-da2', name: 'Eggs (crate, 30)', desc: 'Fresh brown eggs, full crate', priceKobo: 350000, emoji: '🥚'),
        MenuItemData(id: 'jr-da3', name: 'Margerine 500g', desc: 'Blueband margarine spread', priceKobo: 80000, emoji: '🧈'),
      ]),
      MenuCategoryData(name: 'Beverages', items: [
        MenuItemData(id: 'jr-bv1', name: 'Bigi Cola 60cl', desc: 'Affordable soft drink, extra volume', priceKobo: 20000, emoji: '🥤'),
        MenuItemData(id: 'jr-bv2', name: 'Lipton Yellow Label (box)', desc: '25 tea bags, classic blend', priceKobo: 40000, emoji: '🍵'),
        MenuItemData(id: 'jr-bv3', name: 'Nescafé 3-in-1 (10 sachets)', desc: 'Instant coffee with sugar & creamer', priceKobo: 80000, emoji: '☕'),
        MenuItemData(id: 'jr-bv4', name: 'Pure Water (sachet, 30)', desc: 'Fan Milk pure water pack', priceKobo: 35000, emoji: '💧'),
      ]),
      MenuCategoryData(name: 'Snacks', items: [
        MenuItemData(id: 'jr-sn1', name: 'Indomie Noodles (5 packs)', desc: 'Chicken flavour instant noodles', priceKobo: 60000, emoji: '🍜'),
        MenuItemData(id: 'jr-sn2', name: 'Tom Tom Sweets (bag)', desc: 'Mint and fruit flavoured toffee', priceKobo: 40000, emoji: '🍬'),
        MenuItemData(id: 'jr-sn3', name: 'Gala (box of 10)', desc: 'UAC Gala sausage rolls, bulk pack', priceKobo: 250000, emoji: '🌭'),
        MenuItemData(id: 'jr-sn4', name: 'Semolina 1kg', desc: 'Smooth durum wheat semolina', priceKobo: 90000, emoji: '🌾'),
      ]),
    ],
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// RETAIL STORES (3)
// ─────────────────────────────────────────────────────────────────────────────

const kRetailPartners = <PartnerData>[
  PartnerData(
    id: 'zara-lagos',
    name: 'Zara Lagos',
    type: 'Fashion · Lifestyle',
    area: 'Lekki Mall',
    rating: 4.7,
    deliveryTime: '60–90 min',
    deliveryFeeKobo: 80000,
    tag: 'NEW',
    tagColor: GodropColors.blue,
    cuisines: ['Fashion', 'Home'],
    partnerType: PartnerType.retail,
    menuCategories: [
      MenuCategoryData(name: 'Tops', items: [
        MenuItemData(id: 'za-t1', name: 'Classic White T-Shirt', desc: 'Essential slim-fit cotton tee, unisex', priceKobo: 1500000, emoji: '👕'),
        MenuItemData(id: 'za-t2', name: 'Striped Linen Shirt', desc: 'Relaxed fit, breathable linen', priceKobo: 2200000, emoji: '👔'),
        MenuItemData(id: 'za-t3', name: 'Floral Blouse', desc: 'Lightweight flowy blouse with floral print', priceKobo: 2000000, emoji: '👚'),
        MenuItemData(id: 'za-t4', name: 'Ribbed Crop Top', desc: 'Fitted ribbed knit crop top', priceKobo: 1200000, emoji: '👚'),
      ]),
      MenuCategoryData(name: 'Bottoms', items: [
        MenuItemData(id: 'za-b1', name: 'Slim-Fit Jeans', desc: 'Dark wash slim-fit denim jeans', priceKobo: 2500000, emoji: '👖'),
        MenuItemData(id: 'za-b2', name: 'Chino Trousers', desc: 'Tailored chinos in sand beige', priceKobo: 2000000, emoji: '👖'),
        MenuItemData(id: 'za-b3', name: 'Pleated Midi Skirt', desc: 'Flowing pleated skirt, knee-length', priceKobo: 1800000, emoji: '👗'),
        MenuItemData(id: 'za-b4', name: 'Cargo Pants', desc: 'Relaxed utility cargo with pockets', priceKobo: 2200000, emoji: '👖'),
      ]),
      MenuCategoryData(name: 'Dresses', items: [
        MenuItemData(id: 'za-d1', name: 'Wrap Midi Dress', desc: 'Classic wrap in floral print, V-neck', priceKobo: 3500000, emoji: '👗'),
        MenuItemData(id: 'za-d2', name: 'Slip Dress', desc: 'Satin-finish cami slip dress', priceKobo: 2800000, emoji: '👗'),
        MenuItemData(id: 'za-d3', name: 'Shirt Dress', desc: 'Belted cotton shirt dress, knee-length', priceKobo: 3000000, emoji: '👗'),
      ]),
      MenuCategoryData(name: 'Accessories', items: [
        MenuItemData(id: 'za-ac1', name: 'Leather Belt', desc: 'Genuine leather, silver buckle', priceKobo: 1200000, emoji: '👜'),
        MenuItemData(id: 'za-ac2', name: 'Canvas Tote Bag', desc: 'Large structured canvas tote', priceKobo: 2800000, emoji: '👜'),
        MenuItemData(id: 'za-ac3', name: 'Sunglasses', desc: 'Rectangular UV400 frames', priceKobo: 1500000, emoji: '🕶️'),
        MenuItemData(id: 'za-ac4', name: 'Knit Beanie', desc: 'Soft ribbed knit beanie hat', priceKobo: 800000, emoji: '🧢'),
      ]),
      MenuCategoryData(name: 'Shoes', items: [
        MenuItemData(id: 'za-sh1', name: 'Leather Sneakers', desc: 'Clean minimalist leather sneakers, white', priceKobo: 4500000, emoji: '👟'),
        MenuItemData(id: 'za-sh2', name: 'Block Heel Mules', desc: 'Open-toe mules with block heel', priceKobo: 3800000, emoji: '👠'),
        MenuItemData(id: 'za-sh3', name: 'Chelsea Boots', desc: 'Ankle boots with elastic side panels', priceKobo: 5500000, emoji: '👢'),
      ]),
    ],
  ),

  PartnerData(
    id: 'game-stores',
    name: 'Game Stores',
    type: 'Electronics · Appliances',
    area: 'Ikeja City Mall',
    rating: 4.5,
    deliveryTime: '2–4 hrs',
    deliveryFeeKobo: 100000,
    tag: 'HOT DEALS',
    tagColor: GodropColors.orange,
    cuisines: ['Electronics', 'Home', 'Sports'],
    partnerType: PartnerType.retail,
    menuCategories: [
      MenuCategoryData(name: 'Electronics', items: [
        MenuItemData(id: 'gs-el1', name: 'Power Bank 20,000mAh', desc: 'Fast-charging dual USB power bank', priceKobo: 1800000, emoji: '🔋'),
        MenuItemData(id: 'gs-el2', name: 'Bluetooth Earbuds', desc: 'True wireless earbuds with charging case', priceKobo: 2500000, emoji: '🎧'),
        MenuItemData(id: 'gs-el3', name: 'USB-C Charger 65W', desc: 'Compact GaN fast charger', priceKobo: 1200000, emoji: '🔌'),
        MenuItemData(id: 'gs-el4', name: 'Phone Holder (car)', desc: 'Magnetic dashboard mount', priceKobo: 400000, emoji: '📱'),
      ]),
      MenuCategoryData(name: 'Home Appliances', items: [
        MenuItemData(id: 'gs-ha1', name: 'Electric Kettle 1.7L', desc: 'Stainless steel rapid-boil kettle', priceKobo: 1500000, emoji: '☕'),
        MenuItemData(id: 'gs-ha2', name: 'Standing Fan (18")', desc: 'Oscillating 3-speed electric fan', priceKobo: 2200000, emoji: '💨'),
        MenuItemData(id: 'gs-ha3', name: 'Sandwich Toaster', desc: 'Non-stick dual sandwich press', priceKobo: 1800000, emoji: '🥪'),
        MenuItemData(id: 'gs-ha4', name: 'Rechargeable Lamp', desc: 'LED desk lamp with USB output, 8-hr battery', priceKobo: 1200000, emoji: '💡'),
      ]),
      MenuCategoryData(name: 'Sports', items: [
        MenuItemData(id: 'gs-sp1', name: 'Yoga Mat', desc: 'Non-slip 6mm exercise mat, carry strap included', priceKobo: 800000, emoji: '🧘'),
        MenuItemData(id: 'gs-sp2', name: 'Jump Rope', desc: 'Speed skipping rope, adjustable', priceKobo: 300000, emoji: '🏃'),
        MenuItemData(id: 'gs-sp3', name: 'Resistance Bands (set)', desc: '5-piece elastic resistance band set', priceKobo: 1000000, emoji: '💪'),
        MenuItemData(id: 'gs-sp4', name: 'Football', desc: 'Size 5 match ball', priceKobo: 600000, emoji: '⚽'),
      ]),
    ],
  ),

  PartnerData(
    id: 'house-of-tara',
    name: 'House of Tara',
    type: 'Beauty · Cosmetics',
    area: 'Victoria Island',
    rating: 4.8,
    deliveryTime: '45–75 min',
    deliveryFeeKobo: 60000,
    cuisines: ['Beauty', 'Fashion'],
    partnerType: PartnerType.retail,
    menuCategories: [
      MenuCategoryData(name: 'Makeup', items: [
        MenuItemData(id: 'ht-mk1', name: 'Foundation (medium)', desc: 'Satin-finish buildable coverage, warm tan', priceKobo: 1500000, emoji: '💄'),
        MenuItemData(id: 'ht-mk2', name: 'Lip Gloss Set (3 pcs)', desc: 'Nude, berry & coral lip gloss trio', priceKobo: 800000, emoji: '💄'),
        MenuItemData(id: 'ht-mk3', name: 'Mascara', desc: 'Volumising & lengthening black mascara', priceKobo: 1200000, emoji: '👁️'),
        MenuItemData(id: 'ht-mk4', name: 'Eyeshadow Palette (9-pan)', desc: 'Neutral & smoky shades, highly pigmented', priceKobo: 2000000, emoji: '✨'),
      ]),
      MenuCategoryData(name: 'Skincare', items: [
        MenuItemData(id: 'ht-sk1', name: 'SPF 50 Sunscreen 75ml', desc: 'Lightweight UV protection, no white cast', priceKobo: 1500000, emoji: '🧴'),
        MenuItemData(id: 'ht-sk2', name: 'Vitamin C Serum 30ml', desc: 'Brightening & anti-oxidant serum', priceKobo: 2500000, emoji: '🧴'),
        MenuItemData(id: 'ht-sk3', name: 'Moisturiser 100ml', desc: 'Hydrating shea butter cream', priceKobo: 1200000, emoji: '🧴'),
        MenuItemData(id: 'ht-sk4', name: 'Face Wash 150ml', desc: 'Gentle foaming cleanser', priceKobo: 900000, emoji: '🫧'),
      ]),
      MenuCategoryData(name: 'Haircare', items: [
        MenuItemData(id: 'ht-hc1', name: 'Shea Butter Shampoo 300ml', desc: 'Moisturising shampoo for natural hair', priceKobo: 800000, emoji: '🧴'),
        MenuItemData(id: 'ht-hc2', name: 'Edge Control 4oz', desc: 'Firm-hold edges with no flaking', priceKobo: 600000, emoji: '✂️'),
        MenuItemData(id: 'ht-hc3', name: 'Leave-in Conditioner', desc: 'Detangling leave-in for kinky coils', priceKobo: 1000000, emoji: '💆'),
      ]),
      MenuCategoryData(name: 'Fragrance', items: [
        MenuItemData(id: 'ht-fr1', name: 'Tara Signature EDP 50ml', desc: 'Floral & woody signature perfume', priceKobo: 3500000, emoji: '🌸'),
        MenuItemData(id: 'ht-fr2', name: 'Body Mist 250ml', desc: 'Light fruity body spray', priceKobo: 800000, emoji: '💨'),
        MenuItemData(id: 'ht-fr3', name: 'Roll-on Deodorant', desc: '48-hr protection, gentle formula', priceKobo: 500000, emoji: '🌿'),
      ]),
    ],
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// PHARMACIES (3)
// ─────────────────────────────────────────────────────────────────────────────

const kPharmacyPartners = <PartnerData>[
  PartnerData(
    id: 'healthplus',
    name: 'HealthPlus Pharmacy',
    type: 'Pharmacy · Wellness',
    area: 'Lekki Phase 1',
    rating: 4.8,
    deliveryTime: '30–45 min',
    deliveryFeeKobo: 0,
    tag: '24/7',
    tagColor: GodropColors.success,
    cuisines: ['Medications', 'Vitamins', 'Baby', 'Health', 'Personal Care'],
    partnerType: PartnerType.pharmacy,
    menuCategories: [
      MenuCategoryData(name: 'Medications', items: [
        MenuItemData(id: 'hp-md1', name: 'Paracetamol 500mg (strip)', desc: '10 tablets, for fever & pain relief', priceKobo: 50000, emoji: '💊'),
        MenuItemData(id: 'hp-md2', name: 'Ibuprofen 400mg (strip)', desc: '10 tablets, anti-inflammatory', priceKobo: 75000, emoji: '💊'),
        MenuItemData(id: 'hp-md3', name: 'Augmentin 625mg (6 tabs)', desc: 'Broad-spectrum antibiotic course', priceKobo: 250000, emoji: '💊'),
        MenuItemData(id: 'hp-md4', name: 'Malaria Combo (Coartem)', desc: '24-tab artemether-lumefantrine pack', priceKobo: 300000, emoji: '💊'),
        MenuItemData(id: 'hp-md5', name: 'Oral Rehydration Salts (ORS)', desc: '5 sachets, for dehydration & diarrhoea', priceKobo: 40000, emoji: '💧'),
      ]),
      MenuCategoryData(name: 'Vitamins', items: [
        MenuItemData(id: 'hp-vt1', name: 'Vitamin C 1000mg (30 tabs)', desc: 'Effervescent or tablet, immune support', priceKobo: 150000, emoji: '🟠'),
        MenuItemData(id: 'hp-vt2', name: 'Zinc 50mg (30 tabs)', desc: 'Supports immunity & wound healing', priceKobo: 120000, emoji: '🔵'),
        MenuItemData(id: 'hp-vt3', name: 'Omega-3 Fish Oil (60 caps)', desc: 'Heart & brain support softgels', priceKobo: 200000, emoji: '🐟'),
        MenuItemData(id: 'hp-vt4', name: 'Multivitamin (30 tabs)', desc: 'Complete daily multivitamin complex', priceKobo: 250000, emoji: '💊'),
        MenuItemData(id: 'hp-vt5', name: 'Folic Acid 5mg (28 tabs)', desc: 'Essential for pregnancy, cell growth', priceKobo: 80000, emoji: '💊'),
      ]),
      MenuCategoryData(name: 'Baby', items: [
        MenuItemData(id: 'hp-ba1', name: 'Huggies Diapers (S, 32 pcs)', desc: 'Ultra-dry newborn diapers, size Small', priceKobo: 350000, emoji: '🍼'),
        MenuItemData(id: 'hp-ba2', name: 'Baby Johnson Oil 200ml', desc: 'Gentle moisturising baby oil', priceKobo: 180000, emoji: '🧴'),
        MenuItemData(id: 'hp-ba3', name: 'SMA Gold Formula 400g', desc: 'Infant formula for 0–6 months', priceKobo: 800000, emoji: '🍼'),
        MenuItemData(id: 'hp-ba4', name: 'Baby Calpol 100ml', desc: 'Paediatric ibuprofen suspension', priceKobo: 150000, emoji: '🧪'),
      ]),
      MenuCategoryData(name: 'Health', items: [
        MenuItemData(id: 'hp-hl1', name: 'Digital Thermometer', desc: 'Fast-reading oral/axillary thermometer', priceKobo: 350000, emoji: '🌡️'),
        MenuItemData(id: 'hp-hl2', name: 'BP Monitor (wrist)', desc: 'Automatic digital blood pressure monitor', priceKobo: 1500000, emoji: '🫀'),
        MenuItemData(id: 'hp-hl3', name: 'Pulse Oximeter', desc: 'Fingertip SpO2 & heart rate monitor', priceKobo: 800000, emoji: '🩺'),
        MenuItemData(id: 'hp-hl4', name: 'Malaria Rapid Test Kit', desc: 'Self-use RDT strip, results in 15 min', priceKobo: 100000, emoji: '🧫'),
      ]),
      MenuCategoryData(name: 'Personal Care', items: [
        MenuItemData(id: 'hp-pc1', name: 'Hand Sanitizer 500ml', desc: '70% ethanol, with aloe vera', priceKobo: 80000, emoji: '🧴'),
        MenuItemData(id: 'hp-pc2', name: 'Surgical Masks (50 pcs)', desc: '3-ply disposable face masks', priceKobo: 150000, emoji: '😷'),
        MenuItemData(id: 'hp-pc3', name: 'Medicated Soap 100g', desc: 'Dettol or Septol antibacterial bar', priceKobo: 40000, emoji: '🧼'),
        MenuItemData(id: 'hp-pc4', name: 'Elastic Bandage 5cm', desc: 'Self-adhesive crepe bandage', priceKobo: 60000, emoji: '🩹'),
      ]),
    ],
  ),

  PartnerData(
    id: 'medplus',
    name: 'MedPlus Pharmacy',
    type: 'Pharmacy · Retail',
    area: 'Ikeja',
    rating: 4.6,
    deliveryTime: '35–50 min',
    deliveryFeeKobo: 25000,
    cuisines: ['Medications', 'Vitamins', 'Baby', 'Health', 'Personal Care'],
    partnerType: PartnerType.pharmacy,
    menuCategories: [
      MenuCategoryData(name: 'Medications', items: [
        MenuItemData(id: 'mp-md1', name: 'Felvin Gel 50g', desc: 'Topical diclofenac for muscle pain', priceKobo: 120000, emoji: '💊'),
        MenuItemData(id: 'mp-md2', name: 'Flagyl 200mg (21 tabs)', desc: 'Metronidazole antibiotic course', priceKobo: 100000, emoji: '💊'),
        MenuItemData(id: 'mp-md3', name: 'Claritin 10mg (10 tabs)', desc: 'Non-drowsy antihistamine', priceKobo: 180000, emoji: '💊'),
        MenuItemData(id: 'mp-md4', name: 'Gaviscon 150ml', desc: 'Antacid & reflux relief liquid', priceKobo: 120000, emoji: '🧪'),
      ]),
      MenuCategoryData(name: 'Vitamins', items: [
        MenuItemData(id: 'mp-vt1', name: 'Iron + Folic Acid (30 tabs)', desc: 'Combined supplement, especially for women', priceKobo: 100000, emoji: '💊'),
        MenuItemData(id: 'mp-vt2', name: 'Vitamin D3 1000IU (60 caps)', desc: 'Bone health & immune support', priceKobo: 180000, emoji: '☀️'),
        MenuItemData(id: 'mp-vt3', name: 'Calcium + Magnesium (60 tabs)', desc: 'Bone & muscle support complex', priceKobo: 150000, emoji: '🦴'),
      ]),
      MenuCategoryData(name: 'Baby', items: [
        MenuItemData(id: 'mp-ba1', name: 'Pampers Active (M, 44 pcs)', desc: 'Medium diapers, breathable cover', priceKobo: 420000, emoji: '🍼'),
        MenuItemData(id: 'mp-ba2', name: 'Cerelac Rice (400g)', desc: 'Nestlé infant cereal, 6+ months', priceKobo: 280000, emoji: '🥣'),
        MenuItemData(id: 'mp-ba3', name: 'Baby Wipes (80 sheets)', desc: 'Sensitive skin, fragrance-free', priceKobo: 120000, emoji: '🧻'),
      ]),
      MenuCategoryData(name: 'Personal Care', items: [
        MenuItemData(id: 'mp-pc1', name: 'Colgate Total 75ml', desc: 'Cavity protection toothpaste', priceKobo: 60000, emoji: '🦷'),
        MenuItemData(id: 'mp-pc2', name: 'Listerine 250ml', desc: 'Antibacterial mouthwash, cool mint', priceKobo: 100000, emoji: '🫧'),
        MenuItemData(id: 'mp-pc3', name: 'Nivea Lotion 400ml', desc: 'Deep moisture body lotion', priceKobo: 180000, emoji: '🧴'),
        MenuItemData(id: 'mp-pc4', name: 'Plasters (box of 20)', desc: 'Assorted fabric adhesive bandages', priceKobo: 40000, emoji: '🩹'),
      ]),
    ],
  ),

  PartnerData(
    id: 'alpha-pharmacy',
    name: 'Alpha Pharmacy',
    type: 'Pharmacy · Hospital Grade',
    area: 'Victoria Island',
    rating: 4.9,
    deliveryTime: '25–40 min',
    deliveryFeeKobo: 0,
    tag: 'PREMIUM',
    tagColor: Color(0xFF7C3AED),
    cuisines: ['Medications', 'Vitamins', 'Health', 'Personal Care'],
    partnerType: PartnerType.pharmacy,
    menuCategories: [
      MenuCategoryData(name: 'Medications', items: [
        MenuItemData(id: 'ap-md1', name: 'Tramadol 50mg (10 tabs)', desc: 'Prescription pain relief — PRESCRIPTION REQUIRED', priceKobo: 150000, emoji: '💊'),
        MenuItemData(id: 'ap-md2', name: 'Amlodipine 5mg (28 tabs)', desc: 'Calcium channel blocker for BP', priceKobo: 200000, emoji: '💊'),
        MenuItemData(id: 'ap-md3', name: 'Metformin 500mg (30 tabs)', desc: 'Oral diabetes medication', priceKobo: 120000, emoji: '💊'),
        MenuItemData(id: 'ap-md4', name: 'Lisinopril 10mg (28 tabs)', desc: 'ACE inhibitor for hypertension', priceKobo: 250000, emoji: '💊'),
      ]),
      MenuCategoryData(name: 'Vitamins', items: [
        MenuItemData(id: 'ap-vt1', name: 'Pregnacare Plus (56 tabs)', desc: 'Omega-3 & multivitamin for pregnancy', priceKobo: 350000, emoji: '🤰'),
        MenuItemData(id: 'ap-vt2', name: 'Wellman 30 tablets', desc: 'Complete men\'s health supplement', priceKobo: 280000, emoji: '💪'),
        MenuItemData(id: 'ap-vt3', name: 'Wellwoman 30 tablets', desc: 'Complete women\'s health supplement', priceKobo: 280000, emoji: '🌸'),
        MenuItemData(id: 'ap-vt4', name: 'Berocca Boost (15 tabs)', desc: 'B vitamins + C energy supplement', priceKobo: 180000, emoji: '⚡'),
      ]),
      MenuCategoryData(name: 'Health', items: [
        MenuItemData(id: 'ap-hl1', name: 'Blood Glucose Monitor', desc: 'Glucometer with 10 test strips', priceKobo: 1200000, emoji: '🩸'),
        MenuItemData(id: 'ap-hl2', name: 'Medical N95 Respirator', desc: 'GB2626 certified N95 mask (5 pcs)', priceKobo: 150000, emoji: '😷'),
        MenuItemData(id: 'ap-hl3', name: 'Latex Gloves (M, 50 pcs)', desc: 'Powder-free examination gloves', priceKobo: 200000, emoji: '🧤'),
      ]),
      MenuCategoryData(name: 'Personal Care', items: [
        MenuItemData(id: 'ap-pc1', name: 'Savlon 500ml', desc: 'Antiseptic liquid, hospital-grade', priceKobo: 90000, emoji: '🧴'),
        MenuItemData(id: 'ap-pc2', name: 'Cotton Wool 100g', desc: 'Medical grade sterile cotton wool', priceKobo: 50000, emoji: '🪥'),
        MenuItemData(id: 'ap-pc3', name: 'Surgical Spirit 70ml', desc: 'Isopropyl alcohol antiseptic', priceKobo: 40000, emoji: '🧪'),
        MenuItemData(id: 'ap-pc4', name: 'Sterile Gauze (10 pcs)', desc: 'Non-woven sterile wound dressing', priceKobo: 60000, emoji: '🩹'),
      ]),
    ],
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// ALL PARTNERS
// ─────────────────────────────────────────────────────────────────────────────

const kAllPartners = <PartnerData>[
  ...kNigerianRestaurants,
  ...kGroceryPartners,
  ...kRetailPartners,
  ...kPharmacyPartners,
];
