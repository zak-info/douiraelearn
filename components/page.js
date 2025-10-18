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
} from "lucide-react";

export default function ElNourDashboard() {
  // --------- State ---------
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    department: "",
    modules: "",
  });

  // --------- Fetch enseignants ---------
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await fetch("/api/teachers");
    const data = await res.json();
    setTeachers(data);
  };

  const handleAddTeacher = async () => {
    if (newTeacher.name && newTeacher.department) {
      await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      });
      setNewTeacher({ name: "", department: "", modules: "" });
      setIsModalOpen(false);
      fetchTeachers();
    }
  };

  const handleDelete = async (id) => {
    await fetch("/api/teachers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTeachers();
  };

  // --------- Stats ---------
  const stats = [
    { icon: <Users className="w-6 h-6 text-white" />, label: "Élèves", value: 320 },
    { icon: <BookOpen className="w-6 h-6 text-white" />, label: "Cours", value: 42 },
    { icon: <Building2 className="w-6 h-6 text-white" />, label: "Classes", value: 12 },
    { icon: <CalendarDays className="w-6 h-6 text-white" />, label: "Activités", value: 8 },
  ];

  // --------- Sidebar menu ---------
  const menu = [
    { label: "Dashboard", icon: Users },
    { label: "Cours", icon: BookOpen },
    { label: "Classes", icon: Building2 },
    { label: "Activités", icon: CalendarDays },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
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

        {/* Teachers Table */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Liste des Enseignants
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              <UserPlus size={18} /> Ajouter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-yellow-50 text-yellow-700 border-b">
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Département</th>
                  <th className="p-3 text-left">Modules</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-yellow-50">
                    <td className="p-3 text-gray-800">{t.name}</td>
                    <td className="p-3 text-gray-800">{t.department}</td>
                    <td className="p-3 text-gray-800">{t.modules}</td>
                    <td className="p-3 text-right space-x-3">
                      <button className="text-yellow-600 hover:text-yellow-800">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Ajouter un Enseignant
                </h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={newTeacher.name}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Département"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={newTeacher.department}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        department: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Nombre de modules"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={newTeacher.modules}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, modules: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddTeacher}
                    className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
                  >
                    Ajouter
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
