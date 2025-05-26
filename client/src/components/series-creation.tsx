import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSeriesSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostureLibrary } from "./posture-library";
import type { TherapyType, Posture } from "@shared/schema";

export function SeriesCreation() {
  const [showPostureLibrary, setShowPostureLibrary] = useState(false);
  const [selectedPostures, setSelectedPostures] = useState<Posture[]>([]);
  const [postureDurations, setPostureDurations] = useState<{ [key: number]: number }>({});
  const queryClient = useQueryClient();

  const { data: therapyTypes = [] } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const createSeriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/series", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      form.reset();
      setSelectedPostures([]);
      setPostureDurations({});
    },
  });

  const form = useForm({
    resolver: zodResolver(insertSeriesSchema),
    defaultValues: {
      name: "",
      description: "",
      therapyTypeId: 0,
      recommendedSessions: 12,
      estimatedDuration: 0,
      postureIds: [],
      postureDurations: [],
    },
  });

  const updateEstimatedDuration = () => {
    const totalSeconds = selectedPostures.reduce((total, posture) => {
      const duration = postureDurations[posture.id] || posture.duration;
      return total + duration;
    }, 0);
    const minutes = Math.ceil(totalSeconds / 60);
    form.setValue("estimatedDuration", minutes);
  };

  const handlePostureSelect = (postures: Posture[]) => {
    setSelectedPostures(postures);
    const newDurations = { ...postureDurations };
    postures.forEach(posture => {
      if (!(posture.id in newDurations)) {
        newDurations[posture.id] = posture.duration;
      }
    });
    setPostureDurations(newDurations);
    updateEstimatedDuration();
  };

  const handleDurationChange = (postureId: number, duration: number) => {
    setPostureDurations(prev => ({ ...prev, [postureId]: duration }));
    updateEstimatedDuration();
  };

  const onSubmit = (data: any) => {
    const postureIds = selectedPostures.map(p => p.id);
    const durations = selectedPostures.map(p => postureDurations[p.id] || p.duration);
    
    createSeriesMutation.mutate({
      ...data,
      postureIds,
      postureDurations: durations,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Crear Nueva Serie Terapéutica</CardTitle>
            <Button variant="outline" onClick={() => {/* TODO: View all series */}}>
              Ver todas las series
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Serie</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Relajación para Ansiedad Nivel 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="therapyTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Terapia</FormLabel>
                      <Select 
                        value={field.value.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {therapyTypes.map(type => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción de la serie terapéutica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posturas Seleccionadas ({selectedPostures.length} de mínimo 6)
                </label>
                <div className="border border-gray-300 rounded-md p-4 min-h-32 bg-gray-50">
                  {selectedPostures.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                      <i className="fas fa-plus-circle text-2xl mb-2"></i>
                      <p>Haz clic para añadir posturas desde la biblioteca</p>
                      <p className="text-xs mt-1">Mínimo 6 posturas requeridas</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowPostureLibrary(true)}
                      >
                        Abrir Biblioteca de Posturas
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPostures.map((posture, index) => (
                        <div key={posture.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">
                              {index + 1}.
                            </span>
                            <div>
                              <h4 className="text-sm font-medium">{posture.spanishName}</h4>
                              <p className="text-xs text-gray-500">{posture.sanskritName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="30"
                              max="600"
                              value={postureDurations[posture.id] || posture.duration}
                              onChange={(e) => handleDurationChange(posture.id, parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-xs text-gray-500">seg</span>
                          </div>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPostureLibrary(true)}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Añadir más posturas
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="recommendedSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sesiones Recomendadas</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="50" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración Estimada</FormLabel>
                      <FormControl>
                        <Input 
                          value={`${field.value} minutos`} 
                          readOnly 
                          className="bg-gray-50" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Guardar como Borrador
                </Button>
                <Button 
                  type="submit" 
                  disabled={selectedPostures.length < 6 || createSeriesMutation.isPending}
                >
                  {createSeriesMutation.isPending ? "Creando..." : "Crear Serie"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showPostureLibrary && (
        <PostureLibrary
          onClose={() => setShowPostureLibrary(false)}
          onSelectPostures={handlePostureSelect}
          selectedPostures={selectedPostures}
          selectionMode={true}
        />
      )}
    </>
  );
}
