import { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, busesRes, routesRes] = await Promise.all([
        api.get('/students'),
        api.get('/bus'),
        api.get('/routes'),
      ]);

      setStudents(studentsRes.data.students || []);
      setBuses(busesRes.data.buses || []);
      setRoutes(routesRes.data.routes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusAllocation = async (studentId, busId) => {
    try {
      // Convert empty string to null, and string numbers to integers
      const busIdValue = busId === '' || busId === null || busId === undefined 
        ? null 
        : parseInt(busId, 10);
      
      await api.put(`/students/${studentId}`, {
        bus_id: busIdValue,
      });

      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, bus_id: busId || null, buses: busId ? buses.find(b => b.id === parseInt(busId)) : null }
            : student
        )
      );

      setEditingStudent(null);
      setSelectedBusId('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to allocate bus');
      console.error('Error allocating bus:', error);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student.id);
    setSelectedBusId(student.bus_id || '');
  };

  const handleSave = (studentId) => {
    handleBusAllocation(studentId, selectedBusId);
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setSelectedBusId('');
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone.`)) {
      return;
    }

    // Optimistically remove from UI
    const studentToDelete = students.find(s => s.id === studentId);
    setStudents((prev) => prev.filter((student) => student.id !== studentId));

    try {
      await api.delete(`/students/${studentId}`);
      // Success - student already removed from UI
    } catch (error) {
      // Revert on error
      if (studentToDelete) {
        setStudents((prev) => [...prev, studentToDelete].sort((a, b) => a.name.localeCompare(b.name)));
      }
      alert(error.response?.data?.error || 'Error deleting student');
      console.error('Error deleting student:', error);
    }
  };

  const getBusesForRoute = (routeId) => {
    if (!routeId) return buses;
    return buses.filter((bus) => bus.route_id === routeId);
  };

  const filteredStudents = filterRoute
    ? students.filter((student) => {
        if (!student.bus_id) return false;
        const studentBus = buses.find((b) => b.id === student.bus_id);
        return studentBus?.route_id === parseInt(filterRoute);
      })
    : students;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Bus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {filterRoute ? 'No students found for this route' : 'No students registered yet'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const currentBus = buses.find((b) => b.id === student.bus_id);
                const isEditing = editingStudent === student.id;

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.parent?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {student.parent?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={selectedBusId}
                          onChange={(e) => setSelectedBusId(e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        >
                          <option value="">No Bus Assigned</option>
                          {routes.map((route) => {
                            const routeBuses = getBusesForRoute(route.id);
                            if (routeBuses.length === 0) return null;
                            return (
                              <optgroup key={route.id} label={route.name}>
                                {routeBuses.map((bus) => (
                                  <option key={bus.id} value={bus.id}>
                                    {bus.number_plate} (Capacity: {bus.capacity})
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {currentBus ? (
                            <span className="font-medium">{currentBus.number_plate}</span>
                          ) : (
                            <span className="text-gray-400 italic">Not assigned</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {currentBus?.routes?.name || (
                          <span className="text-gray-400 italic">No route</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSave(student.id)}
                            className="text-green-600 hover:text-green-900 font-medium transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            {currentBus ? 'Change Bus' : 'Assign Bus'}
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete student"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Total Students: {students.length}</p>
        <p>Students with Bus Assignment: {students.filter((s) => s.bus_id).length}</p>
        <p>Students without Bus: {students.filter((s) => !s.bus_id).length}</p>
      </div>
    </div>
  );
};

export default StudentManagement;

