import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { PatientManagement } from "@/components/patient-management";
import { SeriesCreation } from "@/components/series-creation";
import { PostureLibrary } from "@/components/posture-library";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  activePatients: number;
  createdSeries: number;
  completedSessions: number;
  averageAdherence: number;
}

export default function InstructorDashboard() {
  const [showPostureLibrary, setShowPostureLibrary] = useState(false);
  
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: series = [] } = useQuery({
    queryKey: ["/api/series"],
  });

  // Calculate stats from data
  const stats: DashboardStats = {
    activePatients: patients.length,
    createdSeries: series.length,
    completedSessions: 0, // This would need to be calculated from sessions data
    averageAdherence: 75, // This would need to be calculated from sessions data
  };

  const recentActivity = [
    {
      description: "Ana Carolina completó sesión",
      timestamp: "Hace 30 minutos",
      type: "success"
    },
    {
      description: 'Nueva serie creada: "Artritis Suave"',
      timestamp: "Hace 2 horas",
      type: "info"
    },
    {
      description: "Luis Torres reportó molestia moderada",
      timestamp: "Hace 4 horas",
      type: "warning"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard del Instructor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-users text-primary text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activePatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-clipboard-list text-secondary text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Series Creadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.createdSeries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-chart-line text-success text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sesiones Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-percentage text-warning text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Adherencia Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageAdherence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PatientManagement patients={patients} />
            <SeriesCreation />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                </div>
                <CardContent className="p-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => {/* TODO: Open add patient modal */}}
                  >
                    <span className="flex items-center">
                      <i className="fas fa-user-plus text-primary mr-3"></i>
                      <span className="text-sm font-medium">Añadir Paciente</span>
                    </span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => setShowPostureLibrary(true)}
                  >
                    <span className="flex items-center">
                      <i className="fas fa-clipboard-list text-secondary mr-3"></i>
                      <span className="text-sm font-medium">Biblioteca de Series</span>
                    </span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => {/* TODO: Open reports */}}
                  >
                    <span className="flex items-center">
                      <i className="fas fa-chart-bar text-warning mr-3"></i>
                      <span className="text-sm font-medium">Reportes</span>
                    </span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-success' :
                          activity.type === 'info' ? 'bg-primary' : 'bg-warning'
                        }`}></div>
                        <div>
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Posture Library Modal */}
      {showPostureLibrary && (
        <PostureLibrary onClose={() => setShowPostureLibrary(false)} />
      )}
    </div>
  );
}
