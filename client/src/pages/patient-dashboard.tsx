import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { SessionExecution } from "@/components/session-execution";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function PatientDashboard() {
  const [showSessionExecution, setShowSessionExecution] = useState(false);

  const { data: activeSeries } = useQuery({
    queryKey: ["/api/my-series"],
  });

  if (!activeSeries) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <i className="fas fa-clipboard-list text-gray-400 text-6xl mb-4"></i>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No tienes series asignadas</h2>
              <p className="text-gray-600">
                Tu instructor aún no te ha asignado ninguna serie terapéutica. 
                Contacta con tu instructor para comenzar tu tratamiento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const series = activeSeries.series;
  const progress = (activeSeries.completedSessions / series.recommendedSessions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Serie Terapéutica</h1>
          <p className="text-gray-600">Sigue tu progreso y ejecuta tu serie personalizada</p>
        </div>

        {/* Series Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{series.name}</CardTitle>
                <CardDescription className="mt-2">
                  {series.description}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                Serie Activa
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {activeSeries.completedSessions}
                </div>
                <div className="text-sm text-gray-600">Sesiones Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {series.recommendedSessions}
                </div>
                <div className="text-sm text-gray-600">Sesiones Recomendadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {series.estimatedDuration}
                </div>
                <div className="text-sm text-gray-600">Minutos por Sesión</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso de la Serie</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Button 
              onClick={() => setShowSessionExecution(true)}
              className="w-full"
              size="lg"
            >
              <i className="fas fa-play mr-2"></i>
              Iniciar Nueva Sesión
            </Button>
          </CardContent>
        </Card>

        {/* Series Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Serie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tipo de Terapia</h4>
                  <p className="text-sm text-gray-600">Ansiedad</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Número de Posturas</h4>
                  <p className="text-sm text-gray-600">{series.postureIds?.length || 0} posturas</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Duración Estimada</h4>
                  <p className="text-sm text-gray-600">{series.estimatedDuration} minutos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consejos para la Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-lightbulb text-warning text-sm mt-0.5"></i>
                  <p className="text-sm text-gray-600">
                    Busca un lugar tranquilo y sin distracciones
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-clock text-primary text-sm mt-0.5"></i>
                  <p className="text-sm text-gray-600">
                    Dedica al menos 30 minutos completos a tu práctica
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-heart text-red-500 text-sm mt-0.5"></i>
                  <p className="text-sm text-gray-600">
                    Escucha a tu cuerpo y no fuerces las posturas
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-comments text-secondary text-sm mt-0.5"></i>
                  <p className="text-sm text-gray-600">
                    Comparte tus comentarios al finalizar la sesión
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Execution Modal */}
      {showSessionExecution && (
        <SessionExecution 
          series={series}
          onClose={() => setShowSessionExecution(false)}
        />
      )}
    </div>
  );
}
