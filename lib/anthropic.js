/**
 * Anthropic AI Service Layer
 * Handles communication with Claude AI models via Puter.js SDK.
 */
import { puter } from "@heyputer/puter.js";
import {
  DIAGNOSIS_SYSTEM_PROMPT,
  WA_SYSTEM_PROMPT,
} from "../constants/prompts";

/**
 * Extracts and cleans JSON objects from raw AI text responses.
 * Resolves markdown wrappers, nested Puter.js structures, and arrays.
 *
 * @param {any} response - The raw response payload from the API
 * @returns {Object} The cleanly parsed JavaScript Object
 * @throws {Error} If parsing fails completely
 */
function extractCleanJSON(response) {
  // 1. Pre-parsed Object Check: Return immediately if already a valid object.
  if (typeof response === "object" && response !== null) {
    if (response.penjelasan_awam || response.rekomendasi_tindakan)
      return response;
    if (response.message?.penjelasan_awam) return response.message;
    if (response.text?.penjelasan_awam) return response.text;
  }

  // 2. Raw Text Extraction: Handle various API wrapper structures including arrays.
  let rawText = "";
  if (typeof response === "string") {
    rawText = response;
  } else if (typeof response?.text === "string") {
    rawText = response.text;
  } else if (typeof response?.message === "string") {
    rawText = response.message;
  } else if (typeof response?.message?.content === "string") {
    rawText = response.message.content;
  } else if (
    Array.isArray(response?.message?.content) &&
    response.message.content.length > 0
  ) {
    rawText = response.message.content[0].text || "";
  } else if (Array.isArray(response?.content) && response.content.length > 0) {
    rawText = response.content[0].text || "";
  } else {
    // Stringify if the payload is an unrecognized object shape
    rawText = JSON.stringify(response);
  }

  // 3. Markdown Surgery: Extract JSON wrapped in markdown blocks (```json ... ```).
  const startIndex = rawText.indexOf("{");
  const endIndex = rawText.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const cleanJson = rawText.substring(startIndex, endIndex + 1);
    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON parse error after substring extraction:", cleanJson);
    }
  }

  // 4. Final Fallback: Attempt direct parsing.
  try {
    // Prevent parsing of the generic "[object Object]" string
    if (rawText === "[object Object]")
      throw new Error("Invalid API Data Format");
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Critical AI JSON parsing failure:", rawText);
    throw new Error("Format balasan AI tidak dapat diproses.");
  }
}

/**
 * Analyzes vehicle complaints using Claude AI.
 * Enforces strict JSON output via system prompts.
 *
 * @param {Object} vehicleData - The customer and vehicle details
 * @returns {Promise<Object>} Parsed diagnosis data
 */
export async function analyzeVehicleComplaint(vehicleData) {
  const userMessage = `
    Nama Pemilik: ${vehicleData.nama_pemilik}
    Plat Nomor: ${vehicleData.plat_nomor}
    Merk Kendaraan: ${vehicleData.merk_kendaraan}
    Keluhan: ${vehicleData.keluhan}
  `;

  const fullPrompt = `${DIAGNOSIS_SYSTEM_PROMPT}\n\nData Kendaraan dan Keluhan:\n${userMessage}`;

  try {
    const response = await puter.ai.chat(fullPrompt, {
      model: "claude-sonnet-4-5",
      // Increase max_tokens to prevent AI from stopping mid-sentence on long responses
      max_tokens: 2048,
      // Lower temperature makes the AI more deterministic and strict with JSON formatting
      temperature: 0.3,
    });

    const finalData = extractCleanJSON(response);
    return finalData;
  } catch (error) {
    console.error("API Connection Error:", error);
    throw new Error(
      "Koneksi AI bermasalah atau respons tidak valid. Coba lagi.",
    );
  }
}

/**
 * Generates a professional WhatsApp message using Claude AI.
 *
 * @param {Object} waData - The service details and tone preferences
 * @returns {Promise<string>} The generated message text
 */
export async function generateWhatsAppMessage(waData) {
  const userMessage = `
    Nama Pelanggan: ${waData.nama_pelanggan}
    Ringkasan Kerusakan: ${waData.ringkasan_kerusakan}
    Estimasi Biaya: Rp ${waData.estimasi_biaya}
    Estimasi Selesai: ${waData.estimasi_selesai}
    Nada Pesan yang diminta: ${waData.nada_pesan}
  `;

  const fullPrompt = `${WA_SYSTEM_PROMPT}\n\nInformasi Servis:\n${userMessage}`;

  try {
    const response = await puter.ai.chat(fullPrompt, {
      model: "claude-sonnet-4-5",
      // Ensure sufficient length for detailed WhatsApp messages
      max_tokens: 1024,
      // Higher temperature allows for more natural, conversational phrasing
      temperature: 0.7,
    });

    let aiText = "";
    if (typeof response === "string") {
      aiText = response;
    } else if (typeof response?.text === "string") {
      aiText = response.text;
    } else if (typeof response?.message === "string") {
      aiText = response.message;
    } else if (typeof response?.message?.content === "string") {
      aiText = response.message.content;
    } else if (
      Array.isArray(response?.message?.content) &&
      response.message.content.length > 0
    ) {
      aiText = response.message.content[0].text || "";
    } else if (
      Array.isArray(response?.content) &&
      response.content.length > 0
    ) {
      aiText = response.content[0].text || "";
    } else {
      aiText =
        typeof response === "object"
          ? JSON.stringify(response)
          : String(response);
    }

    return aiText;
  } catch (error) {
    console.error("API Connection Error:", error);
    throw new Error("Koneksi AI bermasalah saat membuat pesan WA. Coba lagi.");
  }
}
