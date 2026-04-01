import { GoogleGenAI, Type } from "@google/genai";

// Note: In a real production app, ensure logic exists to handle missing keys gracefully.
// We are simulating the "AI" part if no key is present for the demo.

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface TreeAnalysisResult {
  species: string;
  health: string;
  confidence: number;
}

export const analyzeTreeImage = async (base64Image: string, useMock: boolean = false): Promise<TreeAnalysisResult> => {
  const ai = getAiClient();
  
  // Fallback for demo if no API Key or if mock is requested
  if (!ai || useMock) {
    if (useMock) console.log("Using Mock AI Response for Tree Analysis");
    else console.warn("No API Key found. Returning mock AI response.");
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    return {
      species: "ต้นสัก (Teak)",
      health: "แข็งแรงสมบูรณ์ (Healthy)",
      confidence: 0.95
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: 'Identify the tree species in this image and assess its health. The species should be the Thai name. The health should be a Thai description.'
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING },
            health: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["species", "health", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TreeAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return {
      species: "ไม่สามารถระบุได้ (AI Error)",
      health: "กรุณาลองใหม่อีกครั้ง",
      confidence: 0
    };
  }
};

export interface DeedAnalysisResult {
  deedNumber: string;
  ownerName: string;
  rai: number;
  ngan: number;
  wah: number;
  // Detected coordinates from the document text
  location?: { lat: number, lng: number }; 
  // Visual boundary of the document in the image [0-100%]
  documentCorners?: { x: number, y: number }[];
  polygonPoints: [number, number][];
}

export const analyzeLandDeed = async (base64Image: string, useMock: boolean = false): Promise<DeedAnalysisResult> => {
  const ai = getAiClient();

  // Mock response for fallback or forced mock
  if (!ai || useMock) {
    if (useMock) console.log("Using Mock AI Response for Land Deed");
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      deedNumber: "67-99182",
      ownerName: "สมชาย รักป่า",
      rai: 15,
      ngan: 2,
      wah: 50,
      location: { lat: 16.5415, lng: 102.5034 }, // Ban Tha Li
      documentCorners: [
          {x: 10, y: 10}, {x: 90, y: 12}, 
          {x: 88, y: 92}, {x: 12, y: 88}
      ],
      polygonPoints: [
        [16.5415, 102.5034],
        [16.5425, 102.5034],
        [16.5425, 102.5044],
        [16.5415, 102.5044]
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this Thai Land Deed document image carefully.
            
            1. **Boundary Detection**: Identify the 4 corners of the paper document relative to the image size (percentage 0-100).
            2. **Text Extraction**:
               - Deed Number (เลขที่โฉนด)
               - Owner Name (ผู้มีสิทธิครอบครอง)
               - Area: Rai (ไร่), Ngan (งาน), Wah (ตารางวา)
            3. **Geolocation**:
               - Search for any coordinates (Lat/Lng or UTM) written on the deed.
               - Look for the map sheet number or district/province to estimate location if exact coordinates are missing.
               - If found, return the estimated Latitude and Longitude.`
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deedNumber: { type: Type.STRING },
            ownerName: { type: Type.STRING },
            rai: { type: Type.NUMBER },
            ngan: { type: Type.NUMBER },
            wah: { type: Type.NUMBER },
            detectedCoordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              }
            },
            documentCorners: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["deedNumber", "ownerName", "rai", "ngan", "wah"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    
    // Default location if AI couldn't find one (Ban Tha Li)
    const centerLat = parsed.detectedCoordinates?.lat || 16.5415;
    const centerLng = parsed.detectedCoordinates?.lng || 102.5034;

    // Calculate a rough square polygon based on area size
    // 1 Rai = 1600 sqm. Total Area = (Rai * 1600) + (Ngan * 400) + (Wah * 4)
    const totalSqm = (parsed.rai * 1600) + (parsed.ngan * 400) + (parsed.wah * 4);
    const sideLengthMeters = Math.sqrt(totalSqm);
    // Approx degrees (1 deg ~ 111km)
    const latOffset = (sideLengthMeters / 111320) / 2;
    const lngOffset = (sideLengthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)))) / 2;

    const calculatedPolygon: [number, number][] = [
        [centerLat + latOffset, centerLng - lngOffset],
        [centerLat + latOffset, centerLng + lngOffset],
        [centerLat - latOffset, centerLng + lngOffset],
        [centerLat - latOffset, centerLng - lngOffset]
    ];

    return {
      deedNumber: parsed.deedNumber || "Unknown",
      ownerName: parsed.ownerName || "ไม่ระบุ",
      rai: parsed.rai || 0,
      ngan: parsed.ngan || 0,
      wah: parsed.wah || 0,
      location: { lat: centerLat, lng: centerLng },
      documentCorners: parsed.documentCorners || [{x:0,y:0}, {x:100,y:0}, {x:100,y:100}, {x:0,y:100}],
      polygonPoints: calculatedPolygon
    };

  } catch (error) {
    console.error("Deed Analysis Failed", error);
    return {
      deedNumber: "Error",
      ownerName: "Error",
      rai: 0, ngan: 0, wah: 0,
      polygonPoints: []
    };
  }
};