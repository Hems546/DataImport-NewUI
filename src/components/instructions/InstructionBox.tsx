
import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

interface PointerPosition {
  x: number;
  y: number;
  active: boolean;
}

interface InstructionBoxProps {
  id: string;
  initialPosition?: Position;
  onRemove: (id: string) => void;
}

const InstructionBox: React.FC<InstructionBoxProps> = ({
  id,
  initialPosition = { x: 100, y: 100 },
  onRemove,
}) => {
  const { toast } = useToast();
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [text, setText] = useState('Add your instructions here...');
  const [isEditing, setIsEditing] = useState(false);
  const [pointer, setPointer] = useState<PointerPosition>({ x: 0, y: 0, active: false });
  const [isDrawingPointer, setIsDrawingPointer] = useState(false);
  
  const boxRef = useRef<HTMLDivElement>(null);
  
  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  // Set up pointer drawing
  useEffect(() => {
    const handlePointerMouseMove = (e: MouseEvent) => {
      if (isDrawingPointer && boxRef.current) {
        const boxRect = boxRef.current.getBoundingClientRect();
        const boxCenterX = boxRect.left + boxRect.width / 2;
        const boxCenterY = boxRect.top + boxRect.height / 2;
        
        setPointer({
          x: e.clientX - boxCenterX,
          y: e.clientY - boxCenterY,
          active: true,
        });
      }
    };
    
    const handlePointerMouseUp = (e: MouseEvent) => {
      if (isDrawingPointer) {
        // Ensure the pointer position is captured on mouse up
        if (boxRef.current) {
          const boxRect = boxRef.current.getBoundingClientRect();
          const boxCenterX = boxRect.left + boxRect.width / 2;
          const boxCenterY = boxRect.top + boxRect.height / 2;
          
          setPointer({
            x: e.clientX - boxCenterX,
            y: e.clientY - boxCenterY,
            active: true,
          });
        }
        
        setIsDrawingPointer(false);
        toast({
          title: "Pointer created",
          description: "You can now see your instruction pointer"
        });
      }
    };
    
    if (isDrawingPointer) {
      document.addEventListener('mousemove', handlePointerMouseMove);
      document.addEventListener('mouseup', handlePointerMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handlePointerMouseMove);
      document.removeEventListener('mouseup', handlePointerMouseUp);
    };
  }, [isDrawingPointer, toast]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    if (boxRef.current) {
      const boxRect = boxRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - boxRect.left,
        y: e.clientY - boxRect.top,
      });
      setIsDragging(true);
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      toast({
        description: "Instructions saved"
      });
    }
  };
  
  const handleDrawPointer = () => {
    setIsDrawingPointer(true);
    toast({
      description: "Click anywhere on screen and drag to create a pointer"
    });
  };

  const handleRemovePointer = () => {
    setPointer({ x: 0, y: 0, active: false });
    toast({
      description: "Pointer removed"
    });
  };

  return (
    <div
      ref={boxRef}
      className="absolute z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div 
        className="flex items-center justify-between p-2 bg-purple-100 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-800">Instructions</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleEditToggle}
          >
            <Pencil size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={() => onRemove(id)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-3 bg-white">
        {isEditing ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[80px] text-sm"
            placeholder="Add your instructions here..."
          />
        ) : (
          <p className="text-sm whitespace-pre-line">{text}</p>
        )}
        
        <div className="mt-2 flex justify-between">
          {pointer.active ? (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={handleRemovePointer}
            >
              Remove Pointer
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={handleDrawPointer}
            >
              Draw Pointer
            </Button>
          )}
        </div>
      </div>
      
      {/* Pointer line */}
      {pointer.active && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{zIndex: -1}}>
          <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              overflow: 'visible'
            }}
          >
            <defs>
              <marker
                id={`arrowhead-${id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#9b87f5" />
              </marker>
            </defs>
            <line
              x1={position.x + boxRef.current?.clientWidth / 2 || 0}
              y1={position.y + boxRef.current?.clientHeight / 2 || 0}
              x2={position.x + boxRef.current?.clientWidth / 2 + pointer.x || 0}
              y2={position.y + boxRef.current?.clientHeight / 2 + pointer.y || 0}
              stroke="#9b87f5"
              strokeWidth="2"
              markerEnd={`url(#arrowhead-${id})`}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default InstructionBox;
