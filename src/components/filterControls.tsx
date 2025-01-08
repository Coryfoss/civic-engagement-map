import React, { useState } from 'react';
import { SlidersHorizontal, Layers, Sparkles, ChevronDown } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface FilterControlsProps {
  districts: Array<{
    id: string;
    name: string;
    visible: boolean;
  }>;
  onToggleDistrict: (districtId: string) => void;
}

const Button = ({ children, className = '', ...props }: ButtonProps) => (
  <button
    className={`px-3 h-10 text-sm font-medium hover:bg-gray-100 inline-flex items-center ${className}`}
    style={{ whiteSpace: 'nowrap' }}
    {...props}
  >
    {children}
  </button>
);

const FilterControls = ({ districts = [], onToggleDistrict }: FilterControlsProps) => {
  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false);

  return (
    <div className="inline-flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md shadow-sm" style={{backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
      <div className="relative">
       
      </div>

      <Button className="border-r border-gray-200">
        <Layers className="h-4 w-4 mr-2" />
        Detail
      </Button>
      <Button>
        <Sparkles className="h-4 w-4 mr-2" />
        AI
      </Button>
      <Button 
          className="border-r border-gray-200"
          onClick={() => setIsDistrictMenuOpen(!isDistrictMenuOpen)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
        
        {isDistrictMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="p-2">
              {districts.map(district => (
                <label
                  key={district.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  style={{ paddingRight: '4px' }}
                >
                  <input
                    type="checkbox"
                    checked={district.visible}
                    onChange={() => onToggleDistrict(district.id)}
                    className="mr-2"
                  />
                  <span>District {district.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default FilterControls;