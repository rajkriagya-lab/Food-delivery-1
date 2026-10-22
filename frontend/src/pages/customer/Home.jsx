import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, Bike, Check, Clock3, Flame, Heart, 
  Leaf, MapPin, Plus, Search, ShieldCheck, 
  SlidersHorizontal, Star, UtensilsCrossed 
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/axios";
import { useAuthStore } from "../../store/authStore";
const FALLBACK_RESTAURANT = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
const FALLBACK_FOOD = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80";
const FALLBACK_CATEGORY = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";

const filterOptions = [
  { id: "fastest", label: "Fastest delivery", icon: Clock3 },
  { id: "topRated", label: "Top rated 4.5+", icon: Star },
  { id: "offers", label: "Offers", icon: Flame },
  { id: "veg", label: "Veg only", icon: Leaf },
];

const getId = (item) => item?.id || item?._id;
const formatMoney = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-NP")}`;

// Helper to resolve absolute backend URLs vs uploaded relative paths
const resolveImageUrl = (path, fallback) => {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // If backend provides relative path like /uploads/img.png
  const baseURL = axiosInstance.defaults.baseURL || "";
  const cleanBase = baseURL.replace(/\/api\/?$/, ""); 
  return `${cleanBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState({});
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [categoryResult, restaurantResult, foodResult] = await Promise.all([
          axiosInstance.get("/categories/all"),
          axiosInstance.get("/search/popular-resturants"),
          axiosInstance.get("/search/popular-foods"),
        ]);
        if (!active) return;
        setCategories(categoryResult.data.categories || []);
        setRestaurants(restaurantResult.data.restaurants || restaurantResult.data.restaurant || []);
        setFoods(foodResult.data.foods || []);
      } catch {
        if (active) setLoadError("We could not load the menu right now. Please try again in a moment.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (user?.role !== "CUSTOMER") return undefined;
    let active = true;
    axiosInstance.get("/favourites/my").then(({ data }) => {
      if (!active) return;
      const saved = {};
      (data.favourites || []).forEach((favorite) => {
        const id = favorite.foodId || favorite.food?.id;
        if (id) saved[id] = true;
      });
      setFavoriteIds(saved);
    }).catch(() => { if (active) setFavoriteIds({}); });
    return () => { active = false; };
  }, [user]);

  const filterAvailability = {
    fastest: restaurants.some((restaurant) => Number(restaurant.deliveryTimeMinutes) > 0),
    topRated: restaurants.length > 0,
    offers: restaurants.some((restaurant) => restaurant.hasActiveOffer || Number(restaurant.activeOfferCount) > 0),
    veg: foods.some((food) => typeof food.isVeg === "boolean"),
  };

  const visibleRestaurants = useMemo(() => {
    let result = [...restaurants];
    if (activeFilters.includes("topRated")) result = result.filter((restaurant) => Number(restaurant.rating) >= 4.5);
    if (activeFilters.includes("offers")) result = result.filter((restaurant) => restaurant.hasActiveOffer || Number(restaurant.activeOfferCount) > 0);
    if (activeFilters.includes("fastest")) result.sort((a, b) => Number(a.deliveryTimeMinutes || Infinity) - Number(b.deliveryTimeMinutes || Infinity));
    return result;
  }, [restaurants, activeFilters]);

  const visibleFoods = useMemo(() => activeFilters.includes("veg") ? foods.filter((food) => food.isVeg === true) : foods, [foods, activeFilters]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (keyword.trim()) navigate(`/restaurant?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  const toggleFilter = (id) => setActiveFilters((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const addToCart = async (food) => {
    const id = getId(food);
    if (!id) return;
    setAddingId(id);
    try {
      const { data } = await axiosInstance.post("/cart/add", { foodId: id, quantity: 1 });
      toast.success(data.message || `${food.name} added to your cart`);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Log in as a customer to add items to your cart.");
    } finally {
      setAddingId(null);
    }
  };

  const toggleFavorite = async (id) => {
    if (user?.role !== "CUSTOMER") {
      toast.error("Sign in as a customer to save favorites.");
      navigate("/login");
      return;
    }
    setFavoriteBusyId(id);
    try {
      const { data } = await axiosInstance.post(`/favourites/toggle/${id}`);
      setFavoriteIds((current) => ({ ...current, [id]: Boolean(data.isFavourites) }));
      toast.success(data.message || "Favorites updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update favorites.");
    } finally {
      setFavoriteBusyId(null);
    }
  };

  return (
    <main className="freshbite-home min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pb-9 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="relative isolate grid min-h-[380px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 shadow-sm sm:min-h-[430px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-6 py-10 sm:px-10 lg:py-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <Leaf size={15} /> Good food, good mood
            </span>
            <h1 className="freshbite-hero-title mt-5 max-w-xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Your next great meal is <span className="text-[#ff4b3e]">closer than you think.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              Discover neighborhood favorites, order in a few taps, and enjoy something delicious at home.
            </p>

            <form onSubmit={submitSearch} className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-md focus-within:border-[#ff4b3e]/50">
              <Search className="ml-2 shrink-0 text-slate-400" size={19} />
              <label className="sr-only" htmlFor="home-search">Search restaurants and dishes</label>
              <input 
                id="home-search" 
                value={keyword} 
                onChange={(event) => setKeyword(event.target.value)} 
                placeholder="Search dishes or restaurants..." 
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" 
              />
              <button className="rounded-xl bg-[#ff4b3e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e83d32] sm:px-5">
                Find food
              </button>
            </form>

            <div className="freshbite-popular-searches mt-4 flex flex-wrap gap-2 text-xs">
              <span className="mr-1 py-1 font-semibold">Popular:</span>
              {["Momos", "Pizza", "Biryani", "Burger"].map((term) => (
                <button 
                  key={term} 
                  onClick={() => navigate(`/restaurant?keyword=${encodeURIComponent(term)}`)} 
                  className="rounded-full bg-white/90 px-3 py-1.5 font-semibold shadow-xs transition hover:bg-white hover:text-[#ff4b3e]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[230px] items-end justify-center p-5 sm:min-h-[280px] lg:min-h-[380px] lg:p-8">
            <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-3 overflow-hidden rounded-[1.5rem] shadow-xl sm:inset-5">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"
                alt="Juicy burger with fresh toppings"
                className="row-span-2 h-full w-full object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=85"
                alt="Freshly baked pizza"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=85"
                alt="Colorful fresh salad bowl"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="relative mb-3 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Bike size={20} />
              </span>
              <span>
                <strong className="block text-sm font-bold text-slate-900">Made fresh, delivered fast</strong>
                <span className="text-xs text-slate-500">From local kitchens near you</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines / Categories Section */}
      <section className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Browse by taste</p>
            <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">What are you craving?</h2>
          </div>
          <Link to="/cuisines" className="hidden items-center gap-1 text-sm font-bold text-[#ff4b3e] sm:flex">
            All cuisines <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.length ? categories.map((category) => {
            const catImage = resolveImageUrl(category.image, FALLBACK_CATEGORY);
            return (
              <Link 
                key={getId(category)} 
                to={`/restaurant?category=${encodeURIComponent(category.name)}`} 
                className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:-translate-y-0.5 hover:border-[#ff4b3e]/30 hover:shadow-md"
              >
                <img 
                  src={catImage} 
                  onError={(e) => { e.target.src = FALLBACK_CATEGORY; }}
                  alt={category.name} 
                  className="h-8 w-8 rounded-full object-cover" 
                />
                {category.name}
              </Link>
            );
          }) : ["Burgers", "Pizza", "Biryani", "Healthy", "Desserts"].map((name) => (
            <span key={name} className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-xs">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Quick Filters */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-slate-500">
          <SlidersHorizontal size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Quick filters</span>
          <span className="hidden text-xs sm:inline">• Choose what matters to you</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterOptions.map(({ id, label, icon: Icon }) => {
            const disabled = !filterAvailability[id];
            const selected = activeFilters.includes(id);
            return (
              <button 
                key={id} 
                type="button" 
                disabled={disabled} 
                aria-pressed={selected} 
                title={disabled ? `${label} information is not available in the current menu data` : undefined} 
                onClick={() => toggleFilter(id)} 
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"} ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Good things nearby</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Popular restaurants</h2>
          </div>
          <Link to="/restaurant" className="inline-flex items-center gap-1 text-sm font-bold text-[#ff4b3e]">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <RestaurantSkeletons />
        ) : loadError ? (
          <MessageCard message={loadError} action={<button onClick={() => window.location.reload()} className="font-bold text-[#ff4b3e]">Try again</button>} />
        ) : visibleRestaurants.length === 0 ? (
          <MessageCard message="No restaurants match these filters yet." action={<button onClick={() => setActiveFilters([])} className="font-bold text-[#ff4b3e]">Clear filters</button>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRestaurants.map((restaurant) => {
              const id = getId(restaurant);
              const restImage = resolveImageUrl(restaurant.coverImage || restaurant.logo, FALLBACK_RESTAURANT);

              return (
                <article key={id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Link to={`/restaurant/${id}`} className="block">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img 
                        src={restImage} 
                        onError={(e) => { e.target.src = FALLBACK_RESTAURANT; }}
                        alt={restaurant.name} 
                        loading="lazy" 
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" 
                      />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                        <Clock3 size={13} className="text-emerald-600" />
                        {restaurant.deliveryTimeMinutes ? `${restaurant.deliveryTimeMinutes} min` : "Delivery time varies"}
                      </span>
                      <button 
                        type="button" 
                        aria-label={favoriteIds[id] ? "Remove from favorites" : "Add to favorites"} 
                        disabled={favoriteBusyId === id}
                        onClick={(event) => { event.preventDefault(); event.stopPropagation(); void toggleFavorite(id); }} 
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-[#ff4b3e]"
                      >
                        <Heart size={17} className={favoriteIds[id] ? "fill-[#ff4b3e] text-[#ff4b3e]" : ""} />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-slate-900">{restaurant.name}</h3>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {restaurant.cuisines?.join(", ") || restaurant.city || restaurant.address || "Local kitchen"}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                          <Star size={13} fill="currentColor" />
                          {Number(restaurant.rating) > 0 ? Number(restaurant.rating).toFixed(1) : "New"}
                          {Number(restaurant.totalReview) > 0 && <span className="font-medium text-emerald-700/70">({restaurant.totalReview})</span>}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} />
                          {restaurant.city || "Nearby"}
                        </span>
                        <span>Delivery fee {formatMoney(100)}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular Foods Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Popular right now</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Crowd favorites</h2>
          </div>
          <Link to="/restaurant" className="inline-flex items-center gap-1 text-sm font-bold text-[#ff4b3e]">
            Explore menu <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <FoodSkeletons />
        ) : visibleFoods.length === 0 ? (
          <MessageCard message={activeFilters.includes("veg") ? "No vegetarian dishes are listed in the current menu data." : "Popular dishes will show here once they are available."} action={activeFilters.includes("veg") ? <button onClick={() => setActiveFilters((current) => current.filter((filter) => filter !== "veg"))} className="font-bold text-[#ff4b3e]">Show all dishes</button> : null} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleFoods.map((food) => {
              const id = getId(food);
              const foodImg = resolveImageUrl(food.image, FALLBACK_FOOD);

              return (
                <article key={id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Link to={food.slug ? `/food/${food.slug}` : `/restaurant/${food.restaurantId || food.restaurant?.id || ""}`} className="block">
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img 
                        src={foodImg} 
                        onError={(e) => { e.target.src = FALLBACK_FOOD; }}
                        alt={food.name} 
                        loading="lazy" 
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" 
                      />
                      {typeof food.isVeg === "boolean" && (
                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-xs ${food.isVeg ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {food.isVeg ? "Veg" : "Non-veg"}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">{food.name}</h3>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {food.category?.name || food.restaurant?.name || "Freshly prepared"}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-extrabold text-emerald-700">
                        {formatMoney(food.price)}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-[2.25rem] text-xs leading-5 text-slate-500">
                      {food.description || "Made fresh and ready to enjoy."}
                    </p>

                    <button 
                      type="button" 
                      onClick={() => addToCart(food)} 
                      disabled={addingId === id} 
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff1ed] px-3 py-2.5 text-sm font-bold text-[#e83d32] transition hover:bg-[#ff4b3e] hover:text-white disabled:cursor-wait disabled:opacity-60"
                    >
                      <Plus size={16} />
                      {addingId === id ? "Adding…" : "Add to cart"}
                      {addingId === id && <Check size={14} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:grid-cols-3 sm:p-6">
          {[
            { icon: Bike, title: "Local delivery", body: "Order from kitchens around you" },
            { icon: ShieldCheck, title: "Secure checkout", body: "Your order details stay protected" },
            { icon: UtensilsCrossed, title: "Made with care", body: "Discover food worth sharing" }
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon size={18} />
              </span>
              <span>
                <strong className="block text-sm font-bold text-slate-900">{title}</strong>
                <span className="text-xs text-slate-500">{body}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function RestaurantSkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function FoodSkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function MessageCard({ message, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-xs">
      <p className="text-sm text-slate-600">{message}</p>
      {action && <div className="mt-3 text-sm">{action}</div>}
    </div>
  );
}
