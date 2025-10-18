"use client";
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Building2,
  CalendarDays,
  UserPlus,
  Edit,
  Trash2,
  LucideIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  createProfessor,
  getProfessors,
  deleteProfessor,
  updateProfessor,
} from "@/actions/user.action";
import type { Professor, CreateProfessorForm } from "@/types/user.types";

// --------- Types ---------
interface Stat {
  icon: React.ReactNode;
  label: string;
  value: number;
}

interface MenuItem {
  label: string;
  icon: LucideIcon;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export default function ElNourDashboard() {
  // --------- State ---------
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState<CreateProfessorForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    modules: "",
    specialization: "",
    sex: undefined,
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateProfessorForm, string>>>({});

  // --------- Toast Management ---------
  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --------- Fetch professors ---------
  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await getProfessors();
      if (result.success && result.data) {
        setProfessors(result.data);
      } else {
        showToast(result.error || "Failed to fetch professors", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --------- Form Validation ---------
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateProfessorForm, string>> = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --------- Handle Create/Update Professor ---------
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      showToast("Please fix the form errors", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && editingId) {
        const result = await updateProfessor(editingId, formData);
        if (result.success) {
          showToast("Professor updated successfully", "success");
          closeModal();
          fetchProfessors();
        } else {
          showToast(result.error || "Failed to update professor", "error");
        }
      } else {
        const result = await createProfessor(formData);
        if (result.success) {
          showToast("Professor created successfully", "success");
          closeModal();
          fetchProfessors();
        } else {
          showToast(result.error || "Failed to create professor", "error");
        }
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------- Handle Delete ---------
  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const result = await deleteProfessor(id);
      if (result.success) {
        showToast("Professor deleted successfully", "success");
        fetchProfessors();
      } else {
        showToast(result.error || "Failed to delete professor", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    }
  };

  // --------- Handle Edit ---------
  const handleEdit = (professor: Professor): void => {
    setIsEditMode(true);
    setEditingId(professor._id || null);
    setFormData({
      firstName: professor.firstName || "",
      lastName: professor.lastName || "",
      email: professor.email,
      phone: professor.phone || "",
      department: professor.data?.department || "",
      modules: professor.data?.modules || "",
      specialization: professor.data?.specialization || "",
      sex: professor.sex,
      address: professor.address || "",
    });
    setIsModalOpen(true);
  };

  // --------- Reset Form ---------
  const closeModal = (): void => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      modules: "",
      specialization: "",
      sex: undefined,
      address: "",
    });
    setFormErrors({});
  };

  // --------- Stats ---------
  const stats: Stat[] = [
    { icon: <Users className="w-6 h-6 text-white" />, label: "Élèves", value: 320 },
    { icon: <BookOpen className="w-6 h-6 text-white" />, label: "Cours", value: 42 },
    {
      icon: <Building2 className="w-6 h-6 text-white" />,
      label: "Professeurs",
      value: professors.length,
    },
    { icon: <CalendarDays className="w-6 h-6 text-white" />, label: "Activités", value: 8 },
  ];

  // --------- Sidebar menu ---------
  const menu: MenuItem[] = [
    { label: "Dashboard", icon: Users },
    { label: "Cours", icon: BookOpen },
    { label: "Professeurs", icon: Building2 },
    { label: "Activités", icon: CalendarDays },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg min-w-[300px] animate-slide-in ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-yellow-500 to-yellow-700 min-h-screen p-6 shadow-lg text-white">
        {/* User info */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture_719432-2191.jpg"
            alt="User"
            className="w-20 h-20 rounded-full mb-3 border-2 border-white"
          />
          <h3 className="font-semibold text-lg">Admin École Privée El Nour</h3>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-4">
          {menu.map((item, i) => (
            <a
              key={i}
              href="#"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-600 transition"
            >
              <item.icon className="w-5 h-5 text-white" />
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord –{" "}
            <span className="text-yellow-600">École Privée El Nour</span>
          </h1>
          <div className="flex items-center gap-3">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition">
              Paramètres
            </button>
            <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-gray-800">
              Déconnexion
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl p-6 shadow hover:shadow-md transition flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
            >
              <div>
                <p className="text-sm text-white/80">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">{stat.icon}</div>
            </div>
          ))}
        </section>

        {/* Professors Table */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Liste des Professeurs
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <UserPlus size={18} /> Ajouter
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : professors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>Aucun professeur trouvé</p>
              <p className="text-sm mt-1">Ajoutez votre premier professeur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-700 border-b">
                    <th className="p-3 text-left">Nom complet</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Téléphone</th>
                    <th className="p-3 text-left">Département</th>
                    <th className="p-3 text-left">Modules</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map((prof) => (
                    <tr key={prof._id} className="border-b hover:bg-yellow-50 transition">
                      <td className="p-3 text-gray-800">
                        {prof.firstName} {prof.lastName}
                      </td>
                      <td className="p-3 text-gray-800">{prof.email}</td>
                      <td className="p-3 text-gray-600 text-sm">{prof.phone || "—"}</td>
                      <td className="p-3 text-gray-600 text-sm">
                        {prof.data?.department || "—"}
                      </td>
                      <td className="p-3 text-gray-600 text-sm">
                        {prof.data?.modules || "—"}
                      </td>
                      <td className="p-3 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(prof)}
                          className="text-yellow-600 hover:text-yellow-800 transition inline-flex items-center justify-center"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              prof._id!,
                              `${prof.firstName} ${prof.lastName}`
                            )
                          }
                          className="text-red-600 hover:text-red-800 transition inline-flex items-center justify-center"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isEditMode ? "Modifier le Professeur" : "Ajouter un Professeur"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition"
                    disabled={isSubmitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none ${
                        formErrors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        setFormErrors({ ...formErrors, firstName: undefined });
                      }}
                      disabled={isSubmitting}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nom"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none ${
                        formErrors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        setFormErrors({ ...formErrors, lastName: undefined });
                      }}
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="email@exemple.com"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormErrors({ ...formErrors, email: undefined });
                      }}
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+212 6XX XXX XXX"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none ${
                        formErrors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      disabled={isSubmitting}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Département
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mathématiques"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Modules */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modules
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Algèbre, Géométrie"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.modules}
                      onChange={(e) =>
                        setFormData({ ...formData, modules: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spécialisation
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Analyse Numérique"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({ ...formData, specialization: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexe
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.sex || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sex: e.target.value as "male" | "female" | undefined,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionner</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      placeholder="Adresse complète"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition disabled:opacity-50 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditMode ? "Modification..." : "Ajout..."}
                      </>
                    ) : (
                      <>{isEditMode ? "Modifier" : "Ajouter"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
