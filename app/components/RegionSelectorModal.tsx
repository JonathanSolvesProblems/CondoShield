// components/RegionSelectorModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface RegionSelectorModalProps {
  onClose: () => void;
  onSelect: (region: string) => void;
}

const countries = {
  "North America": ["Canada", "USA", "Mexico"],
  Europe: ["United Kingdom", "Germany", "France"],
  Asia: ["India", "China", "Japan"],
  Other: ["Other"],
};

export const RegionSelectorModal: React.FC<RegionSelectorModalProps> = ({
  onClose,
  onSelect,
}) => {
  const [continent, setContinent] = useState<string>("North America");
  const [country, setCountry] = useState<string | null>("Canada");
  const [provinceOrState, setProvinceOrState] = useState("");

  const handleSubmit = () => {
    let fullRegion = continent;
    if (country) fullRegion += ` (${country}`;
    if (provinceOrState) fullRegion += `/${provinceOrState}`;
    if (country) fullRegion += ")";
    onSelect(fullRegion);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg z-50">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Select Your Region
          </Dialog.Title>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium block mb-1">Continent</label>
            <select
              value={continent}
              onChange={(e) => {
                setContinent(e.target.value);
                setCountry(countries[e.target.value]?.[0] || null);
                setProvinceOrState("");
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {Object.keys(countries).map((cont) => (
                <option key={cont}>{cont}</option>
              ))}
            </select>
          </div>

          {country && (
            <div>
              <label className="font-medium block mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {countries[continent].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-medium block mb-1">
              State/Province (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Quebec, California"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={provinceOrState}
              onChange={(e) => setProvinceOrState(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm"
          >
            Save Region
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
