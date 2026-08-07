import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, Heart, MapPin, ShoppingCart, Star, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/axios.js";
import { useAuthStore } from "../../store/authStore.js";

export default function RestaurantDetails() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    const fetchRestaurantDetails = async () => {
        try {
            // Fetch using 'id' instead of 'slug'
            const { data: restaurantData } = await axiosInstance.get( 
                `/restaurants/${id}`
            );
            if (!restaurantData.success) return;
            const restaurantInfo = restaurantData.restaurant;
            setRestaurant(restaurantInfo);

            const { data: foodData } = await axiosInstance.get(
                `/foods/restaurant/${restaurantInfo.id}`
            );

            if (foodData.success) {
                setFoods(foodData.foods || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load restaurant");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchRestaurantDetails();
    }, [id]);

    // Extract unique categories safely
    const categories = [
        ...new Map(
            foods
                .filter((food) => food.category)
                .map((food) => [food.category.id, food.category])
        ).values(),
    ];

    // Fixed type-mismatch bug using String() conversion for comparison
    const filteredFoods =
        selectedCategory === "ALL"
            ? foods
            : foods.filter((food) => String(food.categoryId) === String(selectedCategory));

    const addToCart = async (foodId) => {
        if (!user) {
            toast.error("Please login first");
            return;
        }

        if (user.role !== "CUSTOMER") {
            toast.error("Only customers can add food to cart");
            return;
        }

        try {
            setActionLoading(foodId);
            const { data } = await axiosInstance.post("/cart/add", {
                foodId,
                quantity: 1,
            });
            if (data.success) {
                toast.success(data.message || "Food added to cart");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to add food to cart"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const toggleFavourite = async (foodId) => {
        if (!user) {
            toast.error("Please login first");
            return;
        }

        if (user.role !== "CUSTOMER") {
            toast.error("Only customers can manage favorites");
            return;
        }

        try {
            // Fixed typo: "toggel" -> "toggle"
            const { data } = await axiosInstance.post(`/favourites/toggle/${foodId}`);
            toast.success(data.message || "Updated favorites");

            setFavoriteIds((prev) => {
                const newFavorites = new Set(prev);
                if (newFavorites.has(foodId)) {
                    newFavorites.delete(foodId);
                } else {
                    newFavorites.add(foodId);
                }
                return newFavorites;
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update favourites");
        }
    };

    // --- SKELETON LOADER ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12 animate-pulse">
                <div className="h-64 md:h-80 bg-gray-300 w-full" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
                    <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="flex gap-4 pt-2">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                    <div className="flex gap-3 my-8 overflow-x-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-28 bg-gray-300 rounded-full flex-shrink-0" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                                <div className="h-48 bg-gray-300 rounded-lg" />
                                <div className="h-6 bg-gray-300 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="flex justify-between items-center pt-2">
                                    <div className="h-6 bg-gray-300 rounded w-16" />
                                    <div className="h-10 bg-gray-300 rounded-lg w-28" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- NOT FOUND STATE ---
    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        !
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Restaurant not found</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        The restaurant you are looking for does not exist or has been removed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Restaurant Cover / Banner */}
            <div className="h-64 md:h-80 w-full relative bg-gray-900">
                <img
                    src={restaurant.coverImage || restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Restaurant Details Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Open Now
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">
                                {restaurant.name}
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm md:text-base">
                                {restaurant.cuisineType || restaurant.description || "Delicious foods made with love."}
                            </p>
                        </div>

                        {/* Ratings & Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span>{restaurant.rating || "4.5"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{restaurant.deliveryTime || "30-40 min"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{restaurant.address || "Local Area"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Filtering Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory("ALL")}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${selectedCategory === "ALL"
                                ? "bg-gray-900 text-white shadow-gray-900/20"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        All Items
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${String(selectedCategory) === String(cat.id)
                                    ? "bg-gray-900 text-white shadow-gray-900/20"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Food Grid */}
                {filteredFoods.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center mt-4">
                        <p className="text-gray-500 text-base font-medium">No food items found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                        {filteredFoods.map((food) => {
                            const isFavorite = favoriteIds.has(food.id);
                            return (
                                <div
                                    key={food.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                                >
                                    <div>
                                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                            <img
                                                src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                                                alt={food.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Favorite Button */}
                                            <button
                                                onClick={() => toggleFavourite(food.id)}
                                                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white transition-colors"
                                                aria-label="Save to favorites"
                                            >
                                                <Heart
                                                    className={`w-4 h-4 ${isFavorite
                                                            ? "text-red-500 fill-red-500"
                                                            : "text-gray-600"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                                                {food.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                                {food.description || "Tasty and fresh preparation."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 pt-0 flex items-center justify-between mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-medium">Price</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                ${Number(food.price).toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => addToCart(food.id)}
                                            disabled={actionLoading === food.id}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            {actionLoading === food.id ? "Adding..." : "Add to Cart"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}   