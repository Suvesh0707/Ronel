import { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight, Package, Truck, UserPlus, Check, RefreshCw, Settings, Activity } from "lucide-react";
import axios, { baseURL } from "../api/axios";
import { useToast } from "../utils/ToastProvider";

const DEFAULT_HERO_IMAGES = {
  home: {
    hero: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
    parallax: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=2000",
    newsletter: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600",
  },
  shop: {
    hero: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1600",
    newsletter: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
  },
  contact: {
    hero: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600",
    map: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600",
  },
  about: {
    hero: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600",
    stats: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
    cta: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
  },
};

const HERO_SECTIONS = [
  { value: 'home', label: 'Homepage', subsections: ['hero', 'parallax', 'newsletter'] },
  { value: 'shop', label: 'Shop', subsections: ['hero', 'newsletter'] },
  { value: 'contact', label: 'Contact', subsections: ['hero', 'map'] },
  { value: 'about', label: 'About', subsections: ['hero', 'stats', 'cta'] },
];

export default function AdminDashboard() {
  const { user: _ } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("perfumes"); // perfumes, add, edit
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    fragrance: "",
    intensity: "medium",
    volume: "",
    stock: "",
    description: "",
    inspiredBy: "",
    topNote: "",
    heartNote: "",
    baseNote: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Orders (admin)
  const [groupedByCity, setGroupedByCity] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState("");
  const [assigning, setAssigning] = useState(false);
  // Replacements (admin) — separate tab
  const [replacementOrders, setReplacementOrders] = useState([]);

  // Settings (admin) - COD toggle
  const [codEnabled, setCodEnabled] = useState(false);
  const [codSettingLoading, setCodSettingLoading] = useState(false);

  const [heroSection, setHeroSection] = useState('home');
  const [heroSubSection, setHeroSubSection] = useState('hero');
  const [heroCurrentImage, setHeroCurrentImage] = useState(null);
  const [heroHeading, setHeroHeading] = useState("Timeless Elegance");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Experience fragrances that capture the essence of sophistication and leave a lasting impression"
  );
  const [heroTextColor, setHeroTextColor] = useState("#000000");
  const [heroSelectedFile, setHeroSelectedFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [heroDeleteImage, setHeroDeleteImage] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);

  // Delivery boys (admin)
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [deliveryBoyForm, setDeliveryBoyForm] = useState({ name: "", phone: "", city: "", password: "", isActive: true });
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null);

  // Fetch all perfumes
  const fetchPerfumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/perfumes");
      setPerfumes(res.data.perfumes || []);
    } catch {
      showToast("Failed to fetch perfumes");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPerfumes();
  }, [fetchPerfumes]);

  const fetchOrdersForAdmin = useCallback(async () => {
    try {
      const res = await axios.get("/orders/admin/all");
      setGroupedByCity(res.data.groupedByCity || []);
    } catch {
      showToast("Failed to fetch orders");
    }
  }, [showToast]);

  const fetchReplacementRequests = useCallback(async () => {
    try {
      const res = await axios.get("/orders/admin/replacements");
      setReplacementOrders(res.data.orders || []);
    } catch {
      showToast("Failed to fetch replacement requests");
    }
  }, [showToast]);

  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const res = await axios.get("/delivery/boys");
      setDeliveryBoys(res.data.deliveryBoys || []);
    } catch {
      showToast("Failed to fetch delivery boys");
    }
  }, [showToast]);

  const fetchCodSetting = useCallback(async () => {
    try {
      const res = await axios.get("/settings/admin/cod");
      setCodEnabled(res.data?.codEnabled ?? false);
    } catch {
      showToast("Failed to fetch COD setting");
    }
  }, [showToast]);

  const fetchHeroSettings = useCallback(async () => {
    // Clear immediately so switching sections never shows a stale image
    setHeroCurrentImage(null);
    setHeroSelectedFile(null);
    setHeroPreview(null);
    setHeroDeleteImage(false);
    try {
      const res = await axios.get(`/settings/admin/hero?section=${heroSection}&subSection=${heroSubSection}`);
      const settings = res.data?.settings || {};
      setHeroCurrentImage(settings.image || null);
      setHeroHeading(settings.heading || "");
      setHeroSubtitle(settings.subtitle || "");
      setHeroTextColor(settings.textColor || "#000000");
    } catch {
      showToast("Failed to fetch hero settings");
    }
  }, [showToast, heroSection, heroSubSection]);

  const handleToggleCod = async () => {
    setCodSettingLoading(true);
    try {
      const res = await axios.patch("/settings/admin/cod", { codEnabled: !codEnabled });
      setCodEnabled(res.data?.codEnabled ?? false);
      showToast(res.data?.message || "COD setting updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update");
    } finally {
      setCodSettingLoading(false);
    }
  };

  const handleHeroImageSelection = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
    }
    setHeroSelectedFile(file);
    setHeroPreview(URL.createObjectURL(file));
    setHeroDeleteImage(false);
  };

  const handleCancelHeroImage = () => {
    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
    }
    setHeroSelectedFile(null);
    setHeroPreview(null);
  };

  const handleRemoveHeroImage = () => {
    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
    }
    setHeroSelectedFile(null);
    setHeroPreview(null);
    setHeroDeleteImage(true);
  };

  const handleSaveHeroSettings = async (e) => {
    e.preventDefault();
    setHeroLoading(true);
    try {
      const form = new FormData();
      form.append("heroHeading", heroHeading);
      form.append("heroSubtitle", heroSubtitle);
      form.append("heroTextColor", heroTextColor);
      if (heroSelectedFile) {
        form.append("heroImage", heroSelectedFile);
      }
      if (heroDeleteImage) {
        form.append("deleteImage", "true");
      }

      const res = await axios.patch(`/settings/admin/hero?section=${heroSection}&subSection=${heroSubSection}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const saved = res.data?.settings || {};
      setHeroCurrentImage(saved.image || null);
      setHeroHeading(saved.heading || "");
      setHeroSubtitle(saved.subtitle || "");
      setHeroTextColor(saved.textColor || "#000000");
      setHeroSelectedFile(null);
      setHeroPreview(null);
      setHeroDeleteImage(false);
      showToast(res.data?.message || "Section updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update hero settings");
    } finally {
      setHeroLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrdersForAdmin();
      fetchDeliveryBoys();
    }
    if (activeTab === "replacements") fetchReplacementRequests();
    if (activeTab === "delivery-boys") fetchDeliveryBoys();
    if (activeTab === "settings") {
      fetchCodSetting();
      fetchHeroSettings();
    }
  }, [activeTab, fetchOrdersForAdmin, fetchReplacementRequests, fetchDeliveryBoys, fetchCodSetting, fetchHeroSettings]);

  useEffect(() => {
    // Reset subsection when section changes
    const section = HERO_SECTIONS.find(s => s.value === heroSection);
    if (section && !section.subsections.includes(heroSubSection)) {
      setHeroSubSection(section.subsections[0]);
    }
  }, [heroSection, heroSubSection]);

  const handleAssignDelivery = async () => {
    if (!selectedOrderIds.length || !selectedDeliveryBoyId) {
      showToast("Select at least one order and a delivery boy");
      return;
    }
    setAssigning(true);
    try {
      const res = await axios.post("/orders/admin/assign-delivery", {
        orderIds: selectedOrderIds,
        deliveryBoyId: selectedDeliveryBoyId,
      });
      showToast(res.data.message || "Orders assigned");
      setSelectedOrderIds([]);
      setSelectedDeliveryBoyId("");
      fetchOrdersForAdmin();
    } catch (err) {
      showToast(err.response?.data?.message || "Assign failed");
    } finally {
      setAssigning(false);
    }
  };

  const assignableStatuses = ["placed", "packed", "shipping"];
  const handleMarkDelivered = async (orderId) => {
    try {
      await axios.patch(`/orders/admin/${orderId}/delivered`);
      showToast("Order marked as delivered");
      fetchOrdersForAdmin();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus.replace("_", " ")}`);
      fetchOrdersForAdmin();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const handleResolveReplacement = async (orderId, status) => {
    try {
      await axios.patch(`/orders/admin/${orderId}/replacement`, { status });
      showToast(`Replacement ${status}`);
      fetchReplacementRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const handleAddDeliveryBoy = async (e) => {
    e.preventDefault();
    if (!deliveryBoyForm.name || !deliveryBoyForm.phone || !deliveryBoyForm.city || !deliveryBoyForm.password) {
      showToast("Name, phone, city and password required");
      return;
    }
    try {
      await axios.post("/delivery/boys", deliveryBoyForm);
      showToast("Delivery boy added");
      setDeliveryBoyForm({ name: "", phone: "", city: "", password: "", isActive: true });
      fetchDeliveryBoys();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const handleUpdateDeliveryBoy = async (e) => {
    e.preventDefault();
    if (!editingDeliveryBoy) return;
    try {
      await axios.put(`/delivery/boys/${editingDeliveryBoy._id}`, {
        name: deliveryBoyForm.name,
        phone: deliveryBoyForm.phone,
        city: deliveryBoyForm.city,
        isActive: deliveryBoyForm.isActive,
        ...(deliveryBoyForm.password ? { password: deliveryBoyForm.password } : {}),
      });
      showToast("Updated");
      setEditingDeliveryBoy(null);
      setDeliveryBoyForm({ name: "", phone: "", city: "", password: "", isActive: true });
      fetchDeliveryBoys();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteDeliveryBoy = async (id) => {
    if (!window.confirm("Remove this delivery boy? Their assigned orders will be unassigned.")) return;
    try {
      await axios.delete(`/delivery/boys/${id}`);
      showToast("Removed");
      fetchDeliveryBoys();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add perfume
  const handleAddPerfume = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.fragrance || !formData.intensity || !formData.volume || !formData.stock) {
      return showToast("Please fill all required fields");
    }

    if (images.length === 0) {
      return showToast("Please upload at least one image");
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price);
    form.append("fragrance", formData.fragrance);
    form.append("intensity", formData.intensity);
    form.append("volume", formData.volume);
    form.append("stock", formData.stock);
    form.append("description", formData.description);
    form.append("inspiredBy", formData.inspiredBy);
    form.append("topNote", formData.topNote || "");
    form.append("heartNote", formData.heartNote || "");
    form.append("baseNote", formData.baseNote || "");
    
    images.forEach(img => {
      form.append("images", img);
    });

    try {
      setLoading(true);
      await axios.post("/perfumes", form);
      showToast("Perfume added successfully");
      resetForm();
      setActiveTab("perfumes");
      fetchPerfumes();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add perfume");
    } finally {
      setLoading(false);
    }
  };

  // Update perfume
  const handleUpdatePerfume = async (e) => {
    e.preventDefault();

    if (!selectedPerfume) return;

    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price);
    form.append("fragrance", formData.fragrance);
    form.append("intensity", formData.intensity);
    form.append("volume", formData.volume);
    form.append("stock", formData.stock);
    form.append("description", formData.description);
    form.append("inspiredBy", formData.inspiredBy);
    form.append("topNote", formData.topNote || "");
    form.append("heartNote", formData.heartNote || "");
    form.append("baseNote", formData.baseNote || "");
    
    images.forEach(img => {
      if (img instanceof File) {
        form.append("images", img);
      }
    });

    try {
      setLoading(true);
      await axios.put(`/perfumes/${selectedPerfume._id}`, form);
      showToast("Perfume updated successfully");
      resetForm();
      setActiveTab("perfumes");
      fetchPerfumes();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update perfume");
    } finally {
      setLoading(false);
    }
  };

  // Delete perfume
  const handleDeletePerfume = async (id) => {
    if (window.confirm("Are you sure you want to delete this perfume?")) {
      try {
        await axios.delete(`/perfumes/${id}`);
        showToast("Perfume deleted successfully");
        fetchPerfumes();
      } catch {
        showToast("Failed to delete perfume");
      }
    }
  };

  // Edit perfume
  const handleEditPerfume = (perfume) => {
    setSelectedPerfume(perfume);
    setFormData({
      name: perfume.name,
      price: perfume.price,
      fragrance: perfume.fragrance,
      intensity: perfume.intensity,
      volume: perfume.volume,
      stock: perfume.stock,
      description: perfume.description || "",
      inspiredBy: perfume.inspiredBy || "",
      topNote: perfume.topNote || "",
      heartNote: perfume.heartNote || "",
      baseNote: perfume.baseNote || "",
    });
    setImages(perfume.images || []);
    setImagePreview(perfume.images || []);
    setActiveTab("edit");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      fragrance: "",
      intensity: "medium",
      volume: "",
      stock: "",
      description: "",
      inspiredBy: "",
      topNote: "",
      heartNote: "",
      baseNote: "",
    });
    setImages([]);
    setImagePreview([]);
    setSelectedPerfume(null);
  };

  // Handle image navigation
  const handleNextImage = (perfumeId) => {
    setCurrentImageIndex(prev => {
      const perfume = perfumes.find(p => p._id === perfumeId);
      const maxIndex = perfume?.images?.length - 1 || 0;
      const currentIndex = prev[perfumeId] || 0;
      return {
        ...prev,
        [perfumeId]: currentIndex >= maxIndex ? 0 : currentIndex + 1
      };
    });
  };

  const handlePrevImage = (perfumeId) => {
    setCurrentImageIndex(prev => {
      const perfume = perfumes.find(p => p._id === perfumeId);
      const maxIndex = perfume?.images?.length - 1 || 0;
      const currentIndex = prev[perfumeId] || 0;
      return {
        ...prev,
        [perfumeId]: currentIndex === 0 ? maxIndex : currentIndex - 1
      };
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
          >
            <ArrowLeft size={18} />
            <span className="text-sm tracking-wider">BACK</span>
          </button>
          
          <h1 className="text-6xl md:text-7xl font-serif text-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-500 tracking-wide">Manage perfume inventory</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab("perfumes"); resetForm(); }}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition ${
              activeTab === "perfumes"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            ALL PERFUMES
          </button>
          <button
            onClick={() => { setActiveTab("add"); resetForm(); }}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "add"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Plus size={18} />
            ADD PERFUME
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Package size={18} />
            ORDERS
          </button>
          <button
            onClick={() => setActiveTab("replacements")}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "replacements"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <RefreshCw size={18} />
            REPLACEMENTS
          </button>
          <button
            onClick={() => { setActiveTab("delivery-boys"); setEditingDeliveryBoy(null); setDeliveryBoyForm({ name: "", phone: "", city: "", password: "", isActive: true }); }}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "delivery-boys"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Truck size={18} />
            DELIVERY BOYS
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "settings"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Settings size={18} />
            SETTINGS
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 tracking-wider text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "logs"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Activity size={18} />
            LOGS & METRICS
          </button>
        </div>

        {/* Content */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-700">Assign selected to:</span>
              <select
                value={selectedDeliveryBoyId}
                onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select delivery boy</option>
                {deliveryBoys.map((db) => (
                  <option key={db._id} value={db._id}>{db.name} ({db.city})</option>
                ))}
              </select>
              <button
                onClick={handleAssignDelivery}
                disabled={assigning || !selectedOrderIds.length || !selectedDeliveryBoyId}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {assigning ? "Assigning..." : `Assign ${selectedOrderIds.length} order(s)`}
              </button>
            </div>
            {groupedByCity.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No orders yet</p>
            ) : (
              groupedByCity.map(({ city, orders }) => (
                <div key={city} className="border border-gray-200 rounded-xl overflow-hidden">
                  <h3 className="bg-gray-100 px-4 py-3 font-semibold text-gray-900">{city}</h3>
                  <div className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <div key={order._id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          disabled={!assignableStatuses.includes(order.status)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">Order #{order._id?.slice(-6)} — ₹{order.totalPrice}</p>
                          <p className="text-sm text-gray-600">
                            {order.address?.fullName}, {order.address?.phone} — {order.address?.addressLine}, {order.address?.area}, {order.address?.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: <span className="font-medium">{order.status.replace("_", " ")}</span>
                            {order.deliveryBoy && ` • ${order.deliveryBoy.name}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.status === "placed" && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, "packed")} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm">Packed</button>
                          )}
                          {order.status === "packed" && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, "shipping")} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm">Shipping</button>
                          )}
                          {order.status === "out_for_delivery" && (
                            <button onClick={() => handleMarkDelivered(order._id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                              <Check size={14} /> Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "replacements" && (
          <div className="space-y-6">
            <p className="text-gray-600">Review replacement requests (damaged product). User must upload photo or video proof.</p>
            {replacementOrders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No replacement requests</p>
            ) : (
              <div className="space-y-4">
                {replacementOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id?.slice(-6)} — ₹{order.totalPrice}</p>
                        <p className="text-sm text-gray-600">{order.user?.name} — {order.user?.email}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.items?.map((it) => it.perfume?.name).filter(Boolean).join(", ")}
                        </p>
                        {order.replacementRequest?.comment && (
                          <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{order.replacementRequest.comment}&rdquo;</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {order.replacementRequest?.requestedAt ? new Date(order.replacementRequest.requestedAt).toLocaleString() : ""}
                          {" · "}Status: <span className="font-medium">{order.replacementRequest?.status}</span>
                        </p>
                      </div>
                      {order.replacementRequest?.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleResolveReplacement(order._id, "approved")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Approve</button>
                          <button onClick={() => handleResolveReplacement(order._id, "rejected")} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Reject</button>
                        </div>
                      )}
                    </div>
                    {order.replacementRequest?.proofUrls?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Proof (photo/video):</p>
                        <div className="flex flex-wrap gap-2">
                          {order.replacementRequest.proofUrls.map((url, i) => (
                            <span key={i}>
                              {/\.(mp4|webm|mov|video)/i.test(url) || url.includes("video") ? (
                                <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200">
                                  Watch video {i + 1}
                                </a>
                              ) : (
                                <a href={url} target="_blank" rel="noreferrer" className="block">
                                  <img src={url} alt={`Proof ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90" />
                                </a>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-10 max-w-5xl">
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    When enabled, customers can pay when their order is delivered. When disabled, only online payment is available.
                  </p>
                </div>
                <button
                  onClick={handleToggleCod}
                  disabled={codSettingLoading}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                    codEnabled
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {codSettingLoading ? "Updating…" : codEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveHeroSettings} className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customizable Sections</h3>
                    <p className="text-sm text-gray-600 max-w-2xl">
                      Update images and text for different sections of the {HERO_SECTIONS.find((section) => section.value === heroSection)?.label || 'homepage'}.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Select Page</label>
                      <select
                        value={heroSection}
                        onChange={(e) => setHeroSection(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
                      >
                        {HERO_SECTIONS.map((section) => (
                          <option key={section.value} value={section.value}>{section.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Select Section</label>
                      <select
                        value={heroSubSection}
                        onChange={(e) => setHeroSubSection(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black capitalize"
                      >
                        {HERO_SECTIONS.find(s => s.value === heroSection)?.subsections.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={heroLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50"
                >
                  {heroLoading ? "Saving…" : "Save settings"}
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Current image</p>
                    <img
                      src={heroCurrentImage || (DEFAULT_HERO_IMAGES[heroSection] && DEFAULT_HERO_IMAGES[heroSection][heroSubSection]) || DEFAULT_HERO_IMAGES.home.hero}
                      alt="Current"
                      className="h-56 w-full rounded-2xl object-cover border border-gray-200"
                    />
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Replacement image</p>
                        <p className="text-sm text-gray-500">Choose a new image or remove the custom one.</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
                        Select photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageSelection}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {heroPreview ? (
                      <img
                        src={heroPreview}
                        alt="New preview"
                        className="h-56 w-full rounded-2xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-500">
                        No new image selected
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {heroPreview && (
                        <button
                          type="button"
                          onClick={handleCancelHeroImage}
                          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cancel selection
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveHeroImage}
                        disabled={!heroCurrentImage}
                        className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Remove custom image
                      </button>
                    </div>
                    {heroDeleteImage && (
                      <p className="mt-3 text-sm text-red-600">The custom image will be removed and the default will be shown.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Heading</label>
                      <input
                        type="text"
                        value={heroHeading}
                        onChange={(e) => setHeroHeading(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Subtitle</label>
                      <textarea
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-black resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Text color</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={heroTextColor}
                          onChange={(e) => setHeroTextColor(e.target.value)}
                          className="h-12 w-16 rounded-xl border border-gray-200 p-0"
                        />
                        <span className="text-sm text-gray-600">{heroTextColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Preview (image + text)</p>
                    <div className="relative rounded-2xl overflow-hidden h-48">
                      <img
                        src={heroPreview || heroCurrentImage || DEFAULT_HERO_IMAGES[heroSection]?.[heroSubSection] || DEFAULT_HERO_IMAGES.home.hero}
                        alt="Section preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-start justify-end p-5">
                        <p className="text-xl font-serif font-bold drop-shadow-md leading-tight" style={{ color: heroTextColor }}>
                          {heroHeading || "Heading"}
                        </p>
                        <p className="text-xs mt-1 drop-shadow-md line-clamp-2 opacity-90" style={{ color: heroTextColor }}>
                          {heroSubtitle || "Subtitle text appears here"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === "delivery-boys" && (
          <div className="space-y-8">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-4">{editingDeliveryBoy ? "Edit delivery boy" : "Add delivery boy"}</h3>
              <form onSubmit={editingDeliveryBoy ? handleUpdateDeliveryBoy : handleAddDeliveryBoy} className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={deliveryBoyForm.name}
                  onChange={(e) => setDeliveryBoyForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={deliveryBoyForm.phone}
                  onChange={(e) => setDeliveryBoyForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryBoyForm.city}
                  onChange={(e) => setDeliveryBoyForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder={editingDeliveryBoy ? "New password (leave blank to keep)" : "Password"}
                  value={deliveryBoyForm.password}
                  onChange={(e) => setDeliveryBoyForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  autoComplete={editingDeliveryBoy ? "new-password" : "new-password"}
                  required={!editingDeliveryBoy}
                />
                {editingDeliveryBoy && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deliveryBoyForm.isActive}
                      onChange={(e) => setDeliveryBoyForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    Active
                  </label>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm">
                    {editingDeliveryBoy ? "Update" : "Add"}
                  </button>
                  {editingDeliveryBoy && (
                    <button
                      type="button"
                      onClick={() => { setEditingDeliveryBoy(null); setDeliveryBoyForm({ name: "", phone: "", city: "", password: "", isActive: true }); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">All delivery boys</h3>
              {deliveryBoys.length === 0 ? (
                <p className="text-gray-600">No delivery boys added yet</p>
              ) : (
                <div className="grid gap-3">
                  {deliveryBoys.map((db) => (
                    <div key={db._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <p className="font-medium">{db.name}</p>
                        <p className="text-sm text-gray-600">{db.phone} • {db.city}</p>
                        <p className="text-xs text-gray-500">{db.isActive ? "Active" : "Inactive"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingDeliveryBoy(db); setDeliveryBoyForm({ name: db.name, phone: db.phone, city: db.city, password: "", isActive: db.isActive }); }}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeliveryBoy(db._id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Activity Dashboard</h3>
                <p className="text-sm text-gray-600">Real-time logs, metrics, and user activity monitoring</p>
              </div>
              <a
                href={`${baseURL.replace('/api', '')}/dashboard.html?token=ronellogs123`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2"
              >
                Open in New Tab
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <iframe
                src={`${baseURL.replace('/api', '')}/dashboard.html?token=ronellogs123`}
                title="Ronel Activity Dashboard"
                className="w-full"
                style={{ height: "800px", border: "none" }}
              />
            </div>
          </div>
        )}

        {activeTab === "perfumes" && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : perfumes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No perfumes added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {perfumes.map(perfume => {
                  const imageIndex = currentImageIndex[perfume._id] || 0;
                  const currentImage = perfume.images && perfume.images[imageIndex];
                  const hasMultipleImages = perfume.images && perfume.images.length > 1;
                  
                  return (
                    <div key={perfume._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
                      {/* Image Carousel */}
                      <div className="relative w-full h-64 bg-gray-100 overflow-hidden group">
                        {currentImage ? (
                          <img
                            src={currentImage}
                            alt={perfume.name}
                            className="w-full h-full object-cover hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image size={40} />
                          </div>
                        )}

                        {/* Image Counter */}
                        {hasMultipleImages && (
                          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {imageIndex + 1}/{perfume.images.length}
                          </div>
                        )}

                        {/* Navigation Arrows */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={() => handlePrevImage(perfume._id)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronLeft size={20} className="text-black" />
                            </button>
                            <button
                              onClick={() => handleNextImage(perfume._id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronRight size={20} className="text-black" />
                            </button>
                          </>
                        )}

                        {/* Image Dots */}
                        {hasMultipleImages && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {perfume.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(prev => ({ ...prev, [perfume._id]: idx }))}
                                className={`w-2 h-2 rounded-full transition ${
                                  idx === imageIndex ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-bold text-black mb-2">{perfume.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{perfume.fragrance}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                          <div>Price: ₹{perfume.price}</div>
                          <div>Stock: {perfume.stock}</div>
                          <div>Volume: {perfume.volume}ml</div>
                          <div>Intensity: {perfume.intensity}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditPerfume(perfume)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <Edit2 size={16} />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeletePerfume(perfume._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            <Trash2 size={16} />
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {(activeTab === "add" || activeTab === "edit") && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={activeTab === "add" ? handleAddPerfume : handleUpdatePerfume} className="space-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                  Perfume Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Luxury Essence"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                  required
                />
              </div>

              {/* Price & Volume */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                    Volume (ml) *
                  </label>
                  <input
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    placeholder="50"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Fragrance & Intensity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                    Fragrance Type *
                  </label>
                  <input
                    type="text"
                    name="fragrance"
                    value={formData.fragrance}
                    onChange={handleInputChange}
                    placeholder="e.g., Floral, Woody"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                    Intensity *
                  </label>
                  <select
                    name="intensity"
                    value={formData.intensity}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                    <option value="very strong">Very Strong</option>
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the perfume..."
                  rows="4"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition resize-none"
                />
              </div>

              {/* Inspired By */}
              <div>
                <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                  Inspired By
                </label>
                <input
                  type="text"
                  name="inspiredBy"
                  value={formData.inspiredBy}
                  onChange={handleInputChange}
                  placeholder="e.g., Mediterranean Summer"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                />
              </div>

              {/* Scent Notes (TOP / HEART / BASE) — shown on product cards on hover */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Scent Notes (for product cards)</h4>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-2 font-medium">Top Note</label>
                  <input
                    type="text"
                    name="topNote"
                    value={formData.topNote}
                    onChange={handleInputChange}
                    placeholder="e.g., Bergamot, Lemon, Grapefruit"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-2 font-medium">Heart Note</label>
                  <input
                    type="text"
                    name="heartNote"
                    value={formData.heartNote}
                    onChange={handleInputChange}
                    placeholder="e.g., Lavender, Rosemary, Cedarwood"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-2 font-medium">Base Note</label>
                  <input
                    type="text"
                    name="baseNote"
                    value={formData.baseNote}
                    onChange={handleInputChange}
                    placeholder="e.g., Amber, Musk, Tonka Bean"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs text-gray-500 tracking-widest uppercase mb-3 font-medium">
                  Upload Images * {imagePreview.length > 0 && <span className="text-blue-600">({imagePreview.length} uploaded)</span>}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black outline-none transition cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">You can upload up to 10 images per product. Currently: {imagePreview.length}</p>
                
                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {imagePreview.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={typeof preview === 'string' ? preview : preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition"
                          />
                          <div className="absolute top-1 right-1 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab("perfumes"); resetForm(); }}
                  className="flex-1 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition font-medium tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition font-medium tracking-wider disabled:opacity-50"
                >
                  {loading ? "UPLOADING..." : activeTab === "add" ? "ADD PERFUME" : "UPDATE PERFUME"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
