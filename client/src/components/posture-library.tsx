import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Posture, TherapyType } from "@shared/schema";

interface PostureLibraryProps {
  onClose: () => void;
  onSelectPostures?: (postures: Posture[]) => void;
  selectedPostures?: Posture[];
  selectionMode?: boolean;
}

export function PostureLibrary({ 
  onClose, 
  onSelectPostures, 
  selectedPostures = [], 
  selectionMode = false 
}: PostureLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [therapyFilter, setTherapyFilter] = useState("");
  const [localSelected, setLocalSelected] = useState<Posture[]>(selectedPostures);

  const { data: postures = [] } = useQuery<Posture[]>({
    queryKey: ["/api/postures"],
  });

  const { data: therapyTypes = [] } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const filteredPostures = postures.filter(posture => {
    const matchesSearch = posture.spanishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         posture.sanskritName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTherapy = !therapyFilter || 
                          posture.therapyTypeIds?.includes(parseInt(therapyFilter));
    
    return matchesSearch && matchesTherapy;
  });

  const getTherapyTypeName = (therapyTypeIds: number[] | null) => {
    if (!therapyTypeIds || therapyTypeIds.length === 0) return [];
    return therapyTypeIds.map(id => {
      const type = therapyTypes.find(t => t.id === id);
      return type ? type.name : "";
    }).filter(Boolean);
  };

  const handlePostureToggle = (posture: Posture) => {
    const isSelected = localSelected.some(p => p.id === posture.id);
    
    if (isSelected) {
      setLocalSelected(prev => prev.filter(p => p.id !== posture.id));
    } else {
      setLocalSelected(prev => [...prev, posture]);
    }
  };

  const handleConfirmSelection = () => {
    if (onSelectPostures) {
      onSelectPostures(localSelected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Biblioteca de Posturas</h3>
          <Button variant="ghost" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6 flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar posturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={therapyFilter} onValueChange={setTherapyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {therapyTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectionMode && localSelected.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {localSelected.length} posturas seleccionadas
                </span>
                <Button onClick={handleConfirmSelection}>
                  Confirmar Selección
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPostures.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500">No se encontraron posturas</p>
              </div>
            ) : (
              filteredPostures.map(posture => {
                const isSelected = localSelected.some(p => p.id === posture.id);
                const therapyNames = getTherapyTypeName(posture.therapyTypeIds);
                
                return (
                  <Card 
                    key={posture.id} 
                    className={`cursor-pointer transition-colors ${
                      selectionMode 
                        ? (isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30')
                        : 'hover:border-primary/30'
                    }`}
                    onClick={() => selectionMode && handlePostureToggle(posture)}
                  >
                    <CardContent className="p-4">
                      {selectionMode && (
                        <div className="flex justify-end mb-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handlePostureToggle(posture)}
                          />
                        </div>
                      )}
                      
                      <img 
                        src={posture.imageUrl || "https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"} 
                        alt={posture.spanishName}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">{posture.sanskritName}</h4>
                        <p className="text-sm text-gray-600">{posture.spanishName}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {therapyNames.map(name => (
                            <Badge key={name} variant="secondary" className="text-xs">
                              {name}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-500 line-clamp-2">{posture.benefits}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            Duración: {Math.floor(posture.duration / 60)}:{(posture.duration % 60).toString().padStart(2, '0')} min
                          </span>
                          {!selectionMode && (
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-info-circle"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
