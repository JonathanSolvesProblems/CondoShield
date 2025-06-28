import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FileText, X, Download, Mail } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "../lib/supabaseClient";
import { formatLanguageForPrompt } from "../lib/fetchUserLanguage";

interface DisputeLetterGeneratorProps {
  aiText?: string;
  triggerText?: string;
  preloadedLetter?: string;
  openExternally?: boolean;
  t: (key: string, options?: Record<string, any>) => string;
  language: string;
}

const saveDisputeLetter = async (content: string, title?: string) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    console.error("User not authenticated.");
    return;
  }

  const insertData = {
    content,
    title: title || "Dispute Letter",
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("dispute_letters")
    .insert([insertData]);

  if (error) console.error("Error saving dispute letter:", error);
  return data;
};

export const DisputeLetterGenerator: React.FC<DisputeLetterGeneratorProps> = ({
  aiText,
  triggerText = "Generate Dispute Letter",
  preloadedLetter,
  openExternally,
  t,
  language = "en",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [letterTemplate, setLetterTemplate] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preloadedLetter) {
      setLetterTemplate(preloadedLetter);
      setFields(extractFields(preloadedLetter));
      if (openExternally) setIsOpen(true);
    }
  }, [preloadedLetter]);

  const generateLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-dispute-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: aiText,
          languageNote: formatLanguageForPrompt(language),
        }),
      });

      const data = await res.json();
      setLetterTemplate(data.letter);
      setFields(extractFields(data.letter));
      setIsOpen(true);
    } catch (err) {
      console.error("Letter generation failed", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDispute = async () => {
    setSaving(true);
    setSaved(false);
    const result = await saveDisputeLetter(fillTemplate(true));
    if (result) setSaved(true);
    setSaving(false);
  };

  const exportPDF = async () => {
    const container = document.createElement("div");
    container.innerHTML = fillTemplate(true).replace(/\n/g, "<br/>");
    container.style.width = "800px";
    container.style.padding = "24px";
    container.style.lineHeight = "1.6";
    container.style.background = "white";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2 });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - 40) {
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let pageNum = 0;

      while (remainingHeight > 0) {
        const sourceY =
          (canvas.height * pageNum * (pageHeight - 40)) / imgHeight;
        const sourceHeight = (canvas.height * (pageHeight - 40)) / imgHeight;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext("2d")!;
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImg = pageCanvas.toDataURL("image/png");
        if (pageNum > 0) pdf.addPage();
        pdf.addImage(pageImg, "PNG", 20, 20, imgWidth, pageHeight - 40);

        remainingHeight -= pageHeight - 40;
        pageNum++;
      }
    }

    pdf.save("dispute-letter.pdf");
    document.body.removeChild(container);
  };

  const extractFields = (template: string) => {
    const matches = [...template.matchAll(/{{(.*?)}}/g)];
    const entries = matches.map(([_, key]) => [key.trim(), ""]);
    return Object.fromEntries(entries);
  };

  const fillTemplate = (forExport = false) => {
    let filled = letterTemplate || "";
    Object.entries(fields).forEach(([key, val]) => {
      if (forExport) {
        filled = filled.replaceAll(
          `{{${key}}}`,
          val?.trim() || "________________"
        );
      } else {
        filled = filled.replaceAll(`{{${key}}}`, val || `[${key}]`);
      }
    });
    return filled;
  };

  const exportWord = () => {
    const filledHtml = fillTemplate(true).replace(/\n/g, "<br>");

    const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 12pt;">
        ${filledHtml}
      </body>
    </html>
  `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });
    saveAs(blob, "dispute-letter.doc");
  };

  const sendViaGmail = () => {
    const raw = fillTemplate(true);

    const lines = raw.split("\n");

    let subjectLine = t("dispute.emailSubject");
    const bodyLines: string[] = [];
    for (const line of lines) {
      if (line.toLowerCase().startsWith("subject:")) {
        subjectLine = line.replace(/subject:/i, "").trim();
      } else {
        bodyLines.push(line);
      }
    }

    const subject = encodeURIComponent(subjectLine);
    const body = encodeURIComponent(bodyLines.join("\n"));

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailURL, "_blank");
  };

  return (
    <>
      <button
        onClick={generateLetter}
        disabled={generating}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
      >
        <FileText className="h-5 w-5" />
        <span>{generating ? t("dispute.generating") : triggerText}</span>
      </button>

      {isOpen && (
        <Dialog
          open={true}
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl z-50 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {openExternally
                    ? t("dispute.savedTitle")
                    : t("dispute.editableTitle")}
                </h2>
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div
                id="dispute-letter-content"
                className="prose max-w-none text-gray-800 space-y-4 leading-relaxed px-4"
              >
                {letterTemplate &&
                  letterTemplate.split("\n").map((line, lineIdx) => {
                    const parts = line.split(/({{.*?}})/g);
                    return (
                      <p key={lineIdx}>
                        {parts.map((part, partIdx) => {
                          const match = part.match(/{{(.*?)}}/);
                          if (match) {
                            const keyName = match[1].trim();
                            return (
                              <input
                                key={`${lineIdx}-${partIdx}-${keyName}`}
                                type="text"
                                placeholder={keyName}
                                value={fields[keyName] || ""}
                                onChange={(e) =>
                                  setFields((f) => ({
                                    ...f,
                                    [keyName]: e.target.value,
                                  }))
                                }
                                className="border-b border-gray-400 mx-1 px-1 min-w-[80px] max-w-[250px] text-sm inline-block"
                              />
                            );
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                {!openExternally && (
                  <>
                    <button
                      onClick={handleSaveDispute}
                      disabled={saving || saved}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        saved
                          ? "bg-green-700 text-white"
                          : saving
                          ? "bg-gray-400 text-white"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>
                        {saved
                          ? t("saved")
                          : saving
                          ? t("dispute.saving")
                          : t("dispute.save")}
                      </span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => exportPDF()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{t("dispute.exportPdf")}</span>
                </button>
                <button
                  onClick={() => exportWord()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{t("dispute.exportWord")}</span>
                </button>
                <button
                  onClick={() => sendViaGmail()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>{t("dispute.sendGmail")}</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
};
