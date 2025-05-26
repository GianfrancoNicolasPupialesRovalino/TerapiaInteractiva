import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPatientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, User } from "@shared/schema";

interface PatientWithUser extends Patient {
  user: User;
}

interface PatientManagementProps {
  patients: PatientWithUser[];
}

export function PatientManagement({ patients }: PatientManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const queryClient = useQueryClient();

  const addPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowAddPatient(false);
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      userId: 0,
      instructorId: 0,
      medicalConditions: "",
      notes: "",
    },
  });

  const filteredPatients = patients.filter(patient =>
    patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.medicalConditions?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return "bg-success text-white";
    if (adherence >= 60) return "bg-warning text-white";
    return "bg-destructive text-white";
  };

  const onSubmit = (data: any) => {
    addPatientMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Pacientes</CardTitle>
          <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Añadir Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID de Usuario</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="ID del usuario registrado" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condiciones Médicas</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descripción de condiciones médicas relevantes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas Adicionales</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas del instructor sobre el paciente" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddPatient(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addPatientMutation.isPending}>
                      {addPatientMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar pacientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-users text-4xl mb-4"></i>
              <p>No se encontraron pacientes</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.user.name}</h4>
                    <p className="text-sm text-gray-600">
                      {patient.medicalConditions || "Sin condiciones especificadas"} • 
                      {patient.user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Registro: {new Date(patient.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-success text-white">
                    Activo
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-eye"></i>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-edit"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
