import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Mail,
  User,
  Shield,
  ArrowLeft,
  LogOut,
  Edit2,
  MapPin,
  Plus,
  Trash2,
  Check,
  Search,
} from "lucide-react";
import { useToast } from "../utils/ToastProvider";
import axios from "../api/axios";

const defaultAddressForm = {
  fullName: "",
  phone: "",
  pincode: "",
  state: "",
  district: "",
  city: "",
  area: "",
  addressLine: "",
  landmark: "",
  isDefault: false,
};

export default function MyProfile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [pincodeAreas, setPincodeAreas] = useState([]);
  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [areaOther, setAreaOther] = useState(false);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const { data } = await axios.get("/users/addresses");
      setAddresses(data.addresses || []);
    } catch {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Logged out successfully");
    navigate("/login");
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm(defaultAddressForm);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setPincodeAreas([]);
    setAreaOther(false);
  };

  const handlePincodeLookup = async () => {
    const pc = (addressForm.pincode || "").trim();
    if (pc.length !== 6) {
      showToast("Enter a 6-digit pincode");
      return;
    }
    setPincodeLookupLoading(true);
    setPincodeAreas([]);
    try {
      const { data } = await axios.get(`/users/addresses/pincode/${pc}`);
      if (data.success) {
        setAddressForm((prev) => ({
          ...prev,
          state: data.state || prev.state,
          district: data.district || prev.district,
          city: data.city || prev.city,
        }));
        const areas = data.areas || [];
        setPincodeAreas(areas);
        setAreaOther(false);
        if (areas.length > 0) {
          const current = addressForm.area;
          const keep = areas.includes(current) ? current : areas[0];
          setAddressForm((prev) => ({ ...prev, area: keep }));
        }
        showToast("Address autofilled from pincode");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Pincode not found");
    } finally {
      setPincodeLookupLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { fullName, phone, pincode, state, city, area, addressLine, landmark: _landmark, isDefault: _isDefault } =
      addressForm;
    if (!fullName || !phone || !pincode || !state || !city || !area || !addressLine) {
      showToast("Fill all required fields");
      return;
    }
    try {
      setAddressLoading(true);
      await axios.post("/users/addresses", {
        ...addressForm,
        district: addressForm.district || undefined,
      });
      showToast("Address added");
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddress = (a) => {
    setEditingAddressId(a._id);
    setAddressForm({
      fullName: a.fullName || "",
      phone: a.phone || "",
      pincode: a.pincode || "",
      state: a.state || "",
      district: a.district || "",
      city: a.city || "",
      area: a.area || "",
      addressLine: a.addressLine || "",
      landmark: a.landmark || "",
      isDefault: !!a.isDefault,
    });
    setPincodeAreas([]);
    setAreaOther(false);
    setShowAddressForm(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!editingAddressId) return;
    const { fullName, phone, pincode, state, city, area, addressLine, landmark: _landmark, isDefault: _isDefault } =
      addressForm;
    if (!fullName || !phone || !pincode || !state || !city || !area || !addressLine) {
      showToast("Fill all required fields");
      return;
    }
    try {
      setAddressLoading(true);
      await axios.put(`/users/addresses/${editingAddressId}`, {
        ...addressForm,
        district: addressForm.district || undefined,
      });
      showToast("Address updated");
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setAddressLoading(true);
      await axios.delete(`/users/addresses/${id}`);
      showToast("Address deleted");
      if (editingAddressId === id) resetAddressForm();
      fetchAddresses();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete");
    } finally {
      setAddressLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ronel-surface)] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[var(--ronel-muted)] hover:text-[var(--ronel-primary)] transition"
          >
            <ArrowLeft size={18} />
            <span className="text-sm tracking-wider">BACK</span>
          </button>
          <h1 className="text-2xl font-serif tracking-wider text-[var(--ronel-primary)]">
            MY PROFILE
          </h1>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile card */}
          <div className="md:col-span-1">
            <div className="card-ronel p-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[var(--ronel-primary)] flex items-center justify-center text-white text-3xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-3 text-lg font-medium text-[var(--ronel-primary)]">{user.name}</h2>
                <p className="text-[var(--ronel-muted)] text-xs mt-1">{user.email}</p>
                <span
                  className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <Shield size={14} />
                  {user.role?.toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-xs font-medium"
                >
                  <LogOut size={16} />
                  LOGOUT
                </button>
              </div>
            </div>
          </div>

          {/* Account info + Addresses */}
          <div className="md:col-span-3 space-y-6">
            <div className="card-ronel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--ronel-primary)] tracking-wider">
                  ACCOUNT INFO
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-3 py-1.5 text-[var(--ronel-muted)] hover:text-[var(--ronel-primary)] hover:bg-gray-100 rounded-lg transition text-xs"
                >
                  <Edit2 size={14} />
                  EDIT
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                    FULL NAME
                  </label>
                  <div className="input-ronel flex items-center gap-2">
                    <User size={16} className="text-[var(--ronel-muted)] flex-shrink-0" />
                    <input
                      type="text"
                      value={user.name}
                      readOnly={!isEditing}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                    EMAIL
                  </label>
                  <div className="input-ronel flex items-center gap-2">
                    <Mail size={16} className="text-[var(--ronel-muted)] flex-shrink-0" />
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                    ACCOUNT TYPE
                  </label>
                  <div className="input-ronel flex items-center gap-2">
                    <Shield size={16} className="text-[var(--ronel-muted)] flex-shrink-0" />
                    <input
                      type="text"
                      value={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      readOnly
                      className="bg-transparent outline-none w-full text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="card-ronel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--ronel-primary)] tracking-wider flex items-center gap-2">
                  <MapPin size={20} />
                  SAVED ADDRESSES
                </h3>
                <button
                  onClick={() => {
                    resetAddressForm();
                    setShowAddressForm(!showAddressForm);
                  }}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5"
                >
                  <Plus size={16} />
                  {showAddressForm ? "CANCEL" : "ADD ADDRESS"}
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}
                  className="mb-6 p-4 bg-gray-50 rounded-2xl border border-[var(--ronel-border)] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        Full name *
                      </label>
                      <input
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        className="input-ronel py-2.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        Phone *
                      </label>
                      <input
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        className="input-ronel py-2.5"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        Pincode *
                      </label>
                      <div className="flex gap-2">
                        <input
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          placeholder="e.g. 201301"
                          maxLength={6}
                          className="input-ronel py-2.5 flex-1"
                          required
                        />
                        <button
                          type="button"
                          onClick={handlePincodeLookup}
                          disabled={pincodeLookupLoading || addressForm.pincode.length !== 6}
                          className="btn-primary flex items-center gap-2 py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pincodeLookupLoading ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Search size={16} />
                          )}
                          Look up
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        State *
                      </label>
                      <input
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        placeholder="Auto-filled from pincode"
                        className="input-ronel py-2.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        District
                      </label>
                      <input
                        name="district"
                        value={addressForm.district}
                        onChange={handleAddressChange}
                        placeholder="Auto-filled from pincode"
                        className="input-ronel py-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        City *
                      </label>
                      <input
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="Auto-filled from pincode"
                        className="input-ronel py-2.5"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                        Area *
                      </label>
                      {pincodeAreas.length > 0 ? (
                        <div className="space-y-2">
                          <select
                            value={areaOther ? "__other__" : addressForm.area}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "__other__") {
                                setAreaOther(true);
                                setAddressForm((prev) => ({ ...prev, area: "" }));
                              } else {
                                setAreaOther(false);
                                setAddressForm((prev) => ({ ...prev, area: v }));
                              }
                            }}
                            className="input-ronel py-2.5 w-full"
                          >
                            {pincodeAreas.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                            <option value="__other__">Other (enter manually)</option>
                          </select>
                          {areaOther && (
                            <input
                              name="area"
                              value={addressForm.area}
                              onChange={handleAddressChange}
                              placeholder="Enter your area"
                              className="input-ronel py-2.5"
                              required
                            />
                          )}
                        </div>
                      ) : (
                        <input
                          name="area"
                          value={addressForm.area}
                          onChange={handleAddressChange}
                          placeholder="Look up pincode first or enter manually"
                          className="input-ronel py-2.5"
                          required
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                      Address line *
                    </label>
                    <input
                      name="addressLine"
                      value={addressForm.addressLine}
                      onChange={handleAddressChange}
                      className="input-ronel py-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ronel-muted)] mb-1">
                      Landmark
                    </label>
                    <input
                      name="landmark"
                      value={addressForm.landmark}
                      onChange={handleAddressChange}
                      className="input-ronel py-2.5"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressChange}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--ronel-muted)]">Set as default</span>
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" disabled={addressLoading} className="btn-primary flex items-center gap-2">
                      <Check size={16} />
                      {editingAddressId ? "UPDATE" : "SAVE"}
                    </button>
                    {editingAddressId && (
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 py-2.5 border border-[var(--ronel-border)] rounded-xl hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {addressLoading && !showAddressForm ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ronel-primary)] border-t-transparent" />
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-[var(--ronel-muted)] text-sm py-4">
                  No saved addresses. Add one to use at checkout.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-start justify-between p-4 rounded-xl border border-[var(--ronel-border)] bg-white hover:border-[var(--ronel-primary)]/30 transition"
                    >
                      <div>
                        <p className="font-medium text-[var(--ronel-primary)]">
                          {a.fullName} · {a.phone}
                          {a.isDefault && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[var(--ronel-muted)] mt-1">
                          {a.addressLine}, {a.area}, {a.city}, {a.state} – {a.pincode}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditAddress(a)}
                          className="p-2 rounded-lg text-[var(--ronel-muted)] hover:bg-gray-100 hover:text-[var(--ronel-primary)] transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(a._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
