import { useState, useEffect } from 'react';
import api from '../../services/api';
import Notification from '../../components/Notification';

const AttendancePage = () => {
  const [bus, setBus] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [markingAttendance, setMarkingAttendance] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busRes, studentsRes] = await Promise.all([
          api.get('/bus'),
          api.get('/students'),
        ]);

        if (busRes.data.buses?.length > 0) {
          const driverBus = busRes.data.buses[0];
          setBus(driverBus);
        }
        setStudents(studentsRes.data.students || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance');
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = (response.data.attendance || []).filter(
        a => a.timestamp?.startsWith(today)
      );

      const status = {};
      todayAttendance.forEach(att => {
        if (!status[att.student_id]) {
          status[att.student_id] = { pickup: false, dropoff: false, absent: false };
        }
        status[att.student_id][att.type] = true;
      });
      setAttendanceStatus(status);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    // Fetch today's attendance for students
    if (students.length > 0) {
      fetchTodayAttendance();
    }
  }, [students]);

  const markAttendance = async (studentId, type) => {
    setMarkingAttendance({ ...markingAttendance, [studentId]: type });
    try {
      await api.post('/attendance', {
        student_id: studentId,
        type,
      });
      
      // Refresh attendance status
      await fetchTodayAttendance();
      
      const studentName = students.find(s => s.id === studentId)?.name || 'Student';
      const typeLabels = {
        pickup: 'Pickup',
        dropoff: 'Dropoff',
        absent: 'Absent'
      };
      const notification = {
        id: Date.now(),
        message: `✅ ${typeLabels[type]} marked successfully for ${studentName}`,
        type: 'success',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    } catch (error) {
      const notification = {
        id: Date.now(),
        message: `❌ Error: ${error.response?.data?.error || 'Failed to mark attendance'}`,
        type: 'error',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
      console.error(error);
    } finally {
      setMarkingAttendance({ ...markingAttendance, [studentId]: null });
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getAttendanceStatus = (studentId) => {
    const status = attendanceStatus[studentId];
    if (!status) return { pickup: false, dropoff: false, absent: false };
    return status;
  };

  // Calculate pagination
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="p-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-red-600 text-lg">No bus assigned to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Student Attendance Sheet</h1>
        <p className="text-gray-600">
          Mark pickup, dropoff, or absent for students assigned to your vehicle
        </p>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Bus Info Card */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm text-gray-600">Bus Number:</span>
              <span className="ml-2 font-semibold text-lg">{bus.number_plate}</span>
            </div>
            {bus.routes && (
              <div>
                <span className="text-sm text-gray-600">Route:</span>
                <span className="ml-2 font-medium">{bus.routes.name}</span>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600">Total Students:</span>
              <span className="ml-2 font-bold text-blue-600">{students.length}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Grade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Pickup
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Dropoff
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-lg mb-2">No students assigned to this bus yet.</p>
                    <p className="text-sm text-gray-400">Contact the administrator to assign students to your bus.</p>
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, index) => {
                  const status = getAttendanceStatus(student.id);
                  const isMarking = markingAttendance[student.id];
                  const rowNumber = startIndex + index + 1;
                  
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        status.absent ? 'bg-red-50' : status.pickup && status.dropoff ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {rowNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                        {student.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200">
                        <button
                          onClick={() => markAttendance(student.id, 'pickup')}
                          disabled={status.pickup || status.absent || isMarking}
                          className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                            status.pickup
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : status.absent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isMarking === 'pickup' ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              ...
                            </span>
                          ) : status.pickup ? (
                            '✓ Picked Up'
                          ) : (
                            'Mark Pickup'
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200">
                        <button
                          onClick={() => markAttendance(student.id, 'dropoff')}
                          disabled={status.dropoff || status.absent || isMarking}
                          className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                            status.dropoff
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : status.absent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isMarking === 'dropoff' ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              ...
                            </span>
                          ) : status.dropoff ? (
                            '✓ Dropped Off'
                          ) : (
                            'Mark Dropoff'
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={status.absent || isMarking}
                          className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                            status.absent
                              ? 'bg-red-100 text-red-800 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isMarking === 'absent' ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              ...
                            </span>
                          ) : status.absent ? (
                            '✓ Absent'
                          ) : (
                            'Mark Absent'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {students.length > studentsPerPage && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, students.length)} of {students.length} students
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
