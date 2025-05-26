import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Series, Posture } from "@shared/schema";

interface SessionExecutionProps {
  series: Series;
  onClose: () => void;
}

type IntensityLevel = "none" | "moderate" | "intense";

interface SessionState {
  currentPostureIndex: number;
  timeRemaining: number;
  isPaused: boolean;
  preIntensity: IntensityLevel | null;
  postIntensity: IntensityLevel | null;
  phase: "pre-assessment" | "execution" | "post-assessment";
}

export function SessionExecution({ series, onClose }: SessionExecutionProps) {
  const [sessionState, setSessionState] = useState<SessionState>({
    currentPostureIndex: 0,
    timeRemaining: 0,
    isPaused: false,
    preIntensity: null,
    postIntensity: null,
    phase: "pre-assessment",
  });

  const queryClient = useQueryClient();

  const { data: postures = [] } = useQuery<Posture[]>({
    queryKey: ["/api/postures"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-series"] });
      onClose();
    },
  });

  const form = useForm({
    defaultValues: {
      comments: "",
    },
  });

  // Get postures for this series in order
  const seriesPostures = series.postureIds?.map((id, index) => {
    const posture = postures.find(p => p.id === id);
    const duration = series.postureDurations?.[index] || posture?.duration || 120;
    return posture ? { ...posture, sessionDuration: duration } : null;
  }).filter(Boolean) || [];

  const currentPosture = seriesPostures[sessionState.currentPostureIndex];

  // Timer effect
  useEffect(() => {
    if (sessionState.phase === "execution" && !sessionState.isPaused && sessionState.timeRemaining > 0) {
      const interval = setInterval(() => {
        setSessionState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionState.phase, sessionState.isPaused, sessionState.timeRemaining]);

  // Auto-advance to next posture when timer reaches 0
  useEffect(() => {
    if (sessionState.timeRemaining === 0 && sessionState.phase === "execution") {
      handleNextPosture();
    }
  }, [sessionState.timeRemaining, sessionState.phase]);

  const handleStartSession = () => {
    if (!sessionState.preIntensity) return;
    
    const firstDuration = seriesPostures[0]?.sessionDuration || 120;
    setSessionState(prev => ({
      ...prev,
      phase: "execution",
      timeRemaining: firstDuration,
    }));
  };

  const handlePauseToggle = () => {
    setSessionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleNextPosture = () => {
    const nextIndex = sessionState.currentPostureIndex + 1;
    
    if (nextIndex >= seriesPostures.length) {
      // Session complete
      setSessionState(prev => ({
        ...prev,
        phase: "post-assessment",
      }));
    } else {
      // Next posture
      const nextDuration = seriesPostures[nextIndex]?.sessionDuration || 120;
      setSessionState(prev => ({
        ...prev,
        currentPostureIndex: nextIndex,
        timeRemaining: nextDuration,
        isPaused: false,
      }));
    }
  };

  const handleSubmitSession = (data: { comments: string }) => {
    if (!sessionState.postIntensity || !data.comments.trim()) return;

    createSessionMutation.mutate({
      seriesId: series.id,
      preIntensity: sessionState.preIntensity,
      postIntensity: sessionState.postIntensity,
      comments: data.comments,
      duration: series.estimatedDuration,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((sessionState.currentPostureIndex) / seriesPostures.length) * 100;

  const IntensityButton = ({ 
    level, 
    icon, 
    label, 
    selected, 
    onClick 
  }: { 
    level: IntensityLevel; 
    icon: string; 
    label: string; 
    selected: boolean; 
    onClick: () => void;
  }) => (
    <Button
      variant="outline"
      className={`p-4 h-auto flex-col space-y-2 ${
        selected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <i className={`${icon} text-2xl ${
        level === 'none' ? 'text-success' :
        level === 'moderate' ? 'text-warning' : 'text-destructive'
      }`}></i>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ejecutar Serie</h3>
            <p className="text-sm text-gray-600">
              Serie: {series.name} • 
              {sessionState.phase === "execution" && 
                ` Postura ${sessionState.currentPostureIndex + 1} de ${seriesPostures.length}`
              }
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Pre-session Assessment */}
          {sessionState.phase === "pre-assessment" && (
            <div className="text-center max-w-md mx-auto">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Antes de comenzar</h4>
              <p className="text-gray-600 mb-6">¿Cómo te sientes actualmente?</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <IntensityButton
                  level="none"
                  icon="fas fa-smile"
                  label="Sin molestias"
                  selected={sessionState.preIntensity === "none"}
                  onClick={() => setSessionState(prev => ({ ...prev, preIntensity: "none" }))}
                />
                <IntensityButton
                  level="moderate"
                  icon="fas fa-meh"
                  label="Moderado"
                  selected={sessionState.preIntensity === "moderate"}
                  onClick={() => setSessionState(prev => ({ ...prev, preIntensity: "moderate" }))}
                />
                <IntensityButton
                  level="intense"
                  icon="fas fa-frown"
                  label="Intenso"
                  selected={sessionState.preIntensity === "intense"}
                  onClick={() => setSessionState(prev => ({ ...prev, preIntensity: "intense" }))}
                />
              </div>
              
              <Button 
                onClick={handleStartSession}
                disabled={!sessionState.preIntensity}
                className="w-full"
                size="lg"
              >
                Comenzar Sesión
              </Button>
            </div>
          )}

          {/* Session Execution */}
          {sessionState.phase === "execution" && currentPosture && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <img 
                  src={currentPosture.imageUrl || "https://images.unsplash.com/photo-1593810451137-5dc55105dace?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
                  alt={currentPosture.spanishName}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentPosture.sanskritName} - {currentPosture.spanishName}
                </h4>
                <p className="text-gray-600 mb-4">{currentPosture.instructions}</p>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm text-gray-600">
                    Postura {sessionState.currentPostureIndex + 1} de {seriesPostures.length}
                  </span>
                  <div className="flex-1">
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#E5E7EB" strokeWidth="6" fill="none"/>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="6" 
                        fill="none"
                        strokeLinecap="round" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (sessionState.timeRemaining / (currentPosture.sessionDuration || 120)) * 283}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatTime(sessionState.timeRemaining)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Tiempo restante</p>
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={handlePauseToggle}
                    className="w-full"
                    size="lg"
                  >
                    <i className={`fas ${sessionState.isPaused ? 'fa-play' : 'fa-pause'} mr-2`}></i>
                    {sessionState.isPaused ? 'Continuar' : 'Pausar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextPosture}
                    className="w-full"
                  >
                    Siguiente Postura
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Beneficios:</h5>
                  <p className="text-sm text-gray-600 mb-4">{currentPosture.benefits}</p>
                  
                  {currentPosture.modifications && (
                    <>
                      <h5 className="font-medium text-gray-900 mb-2">Modificaciones:</h5>
                      <p className="text-sm text-gray-600">{currentPosture.modifications}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Post-session Assessment */}
          {sessionState.phase === "post-assessment" && (
            <div className="text-center max-w-md mx-auto">
              <i className="fas fa-check-circle text-6xl text-success mb-4"></i>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">¡Sesión Completada!</h4>
              <p className="text-gray-600 mb-6">¿Cómo te sientes después de la sesión?</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <IntensityButton
                  level="none"
                  icon="fas fa-smile"
                  label="Sin molestias"
                  selected={sessionState.postIntensity === "none"}
                  onClick={() => setSessionState(prev => ({ ...prev, postIntensity: "none" }))}
                />
                <IntensityButton
                  level="moderate"
                  icon="fas fa-meh"
                  label="Moderado"
                  selected={sessionState.postIntensity === "moderate"}
                  onClick={() => setSessionState(prev => ({ ...prev, postIntensity: "moderate" }))}
                />
                <IntensityButton
                  level="intense"
                  icon="fas fa-frown"
                  label="Intenso"
                  selected={sessionState.postIntensity === "intense"}
                  onClick={() => setSessionState(prev => ({ ...prev, postIntensity: "intense" }))}
                />
              </div>
              
              <form onSubmit={form.handleSubmit(handleSubmitSession)} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios (obligatorio)
                  </label>
                  <Textarea
                    {...form.register("comments", { required: true })}
                    rows={4}
                    placeholder="Describe cómo te sentiste durante la sesión, qué posturas fueron más difíciles, etc."
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={!sessionState.postIntensity || createSessionMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createSessionMutation.isPending ? "Guardando..." : "Finalizar y Guardar"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
