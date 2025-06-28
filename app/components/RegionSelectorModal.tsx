// components/RegionSelectorModal.tsx
import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface RegionSelectorModalProps {
  onClose: () => void;
  onSelect: (region: string) => void;
  onRegionUpdated?: () => void;
  initialRegion?: string;
  t: (key: string) => string;
}

export const RegionSelectorModal: React.FC<RegionSelectorModalProps> = ({
  onClose,
  onSelect,
  onRegionUpdated,
  initialRegion,
  t,
}) => {
  const [continent, setContinent] = useState<string>("northAmerica");
  const [country, setCountry] = useState<string>("canada");
  const [provinceOrState, setProvinceOrState] = useState("");

  const countries = {
    northAmerica: ["canada", "usa", "mexico"],
    europe: ["uk", "germany", "france"],
    asia: ["india", "china", "japan"],
    other: ["other"],
  };

  useEffect(() => {
    if (!initialRegion) return;

    const match = initialRegion.match(/^(.+?)\s\(([^/()]+)(?:\/([^()]+))?\)$/);
    const parsedContinentLabel = match?.[1];
    const parsedCountryLabel = match?.[2];
    const parsedProvince = match?.[3] ?? "";

    // Reverse-map label back to key
    const continentKey =
      Object.entries({
        northAmerica: t("regions.northAmerica"),
        europe: t("regions.europe"),
        asia: t("regions.asia"),
        other: t("regions.other"),
      }).find(([, label]) => label === parsedContinentLabel)?.[0] ??
      "northAmerica";

    const countryKey =
      Object.entries({
        canada: t("countries.canada"),
        usa: t("countries.usa"),
        mexico: t("countries.mexico"),
        uk: t("countries.uk"),
        germany: t("countries.germany"),
        france: t("countries.france"),
        india: t("countries.india"),
        china: t("countries.china"),
        japan: t("countries.japan"),
        other: t("countries.other"),
      }).find(([, label]) => label === parsedCountryLabel)?.[0] ?? "canada";

    setContinent(continentKey);
    setCountry(countryKey);
    setProvinceOrState(parsedProvince);
  }, [initialRegion, t]);

  const handleSubmit = async () => {
    let fullRegion = continent;
    if (country) fullRegion += ` (${country}`;
    if (provinceOrState) fullRegion += `/${provinceOrState}`;
    if (country) fullRegion += ")";

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && user) {
      const { error: dbError } = await supabase.from("user_locations").upsert(
        {
          user_id: user.id,
          continent,
          country,
          region: provinceOrState || null,
        },
        { onConflict: "user_id" } // This ensures overwrite if user_id already exists
      );

      if (dbError) {
        console.error("Failed to save region:", dbError.message);
      }
    }

    onSelect(fullRegion);
    onRegionUpdated?.();
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
            {t("selectRegion")}
          </Dialog.Title>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium block mb-1">{t("continent")}</label>
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
                <option key={cont} value={cont}>
                  {t(`regions.${cont}`)}
                </option>
              ))}
            </select>
          </div>

          {country && (
            <div>
              <label className="font-medium block mb-1">{t("country")}</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {countries[continent].map((c) => (
                  <option key={c} value={c}>
                    {t(`countries.${c}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-medium block mb-1">
              {t("provinceSlashState")}
            </label>
            <input
              type="text"
              placeholder={t("exampleProvinceOrStateText")}
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
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm"
          >
            {t("saveRegion")}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
