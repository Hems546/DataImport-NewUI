
import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical, Pencil, Edit } from 'lucide-react';
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
  initialText?: string;
  initialPointer?: PointerPosition;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: any) => void;
  editMode?: boolean;
}

const InstructionBox: React.FC<InstructionBoxProps> = ({
  id,
  initialPosition = { x: 100, y: 100 },
  initialText = 'Add your instructions here...',
  initialPointer = { x: 0, y: 0, active: false },
  onRemove,
  onUpdate,
  editMode = true,
}) => {
  const { toast } = useToast();
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [pointer, setPointer] = useState<PointerPosition>(initialPointer);
  const [isDrawingPointer, setIsDrawingPointer] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const boxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Notify parent component of updates to persist
  useEffect(() => {
    if (onUpdate) {
      onUpdate(id, { position, text, pointer });
    }
  }, [id, position, text, pointer, onUpdate]);
  
  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        setPosition(newPosition);
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
          description: "Pointer created"
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
  
  // Focus the textarea and clear placeholder text when editing is enabled
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      
      // If the text is the default placeholder, clear it
      if (text === 'Add your instructions here...') {
        setText('');
      }
    }
  }, [isEditing, text]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    // Only allow dragging in edit mode
    if (!editMode) return;
    
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handle focusing on the text area and clearing default text
  const handleTextAreaFocus = () => {
    if (!isEditing && editMode) {
      setIsEditing(true);
    }
    
    // Clear the placeholder text when clicked if it's the default text
    if (text === 'Add your instructions here...') {
      setText('');
    }
  };

  return (
    <div
      ref={boxRef}
      className="absolute z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div 
        className={`flex items-center justify-between p-2 bg-purple-100 ${editMode ? 'cursor-move' : ''}`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center">
          {editMode && <GripVertical size={16} className="text-gray-600 mr-2" />}
          <span className="text-sm font-medium text-gray-800">Instructions</span>
        </div>
        {editMode && (
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
        )}
        
        {!editMode && showControls && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => {
              // Ask the InstructionManager to toggle edit mode
              if (onUpdate) {
                toast({
                  description: "Edit mode enabled",
                });
              }
            }}
          >
            <Edit size={14} />
          </Button>
        )}
      </div>
      
      <div className="p-3 bg-white">
        {isEditing && editMode ? (
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onFocus={handleTextAreaFocus}
            className="min-h-[80px] text-sm"
            placeholder="Add your instructions here..."
          />
        ) : (
          <p 
            className="text-sm whitespace-pre-line cursor-text" 
            onClick={handleTextAreaFocus}
          >
            {text}
          </p>
        )}
        
        {editMode && (
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
        )}
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
