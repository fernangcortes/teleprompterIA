import { ParsedWord } from "../types";

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
};

/**
 * Levenshtein Distance (Fuzzy Match)
 */
export const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, 
          Math.min(
            matrix[i][j - 1] + 1, 
            matrix[i - 1][j] + 1  
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const findBestMatch = (
    spokenSnippet: string[], 
    allWords: ParsedWord[], 
    startSearch: number, 
    endSearch: number,
    toleranceLevel: number
): { score: number; index: number } => {
    let bestScore = 0;
    let bestIndex = -1;

    const safeStart = Math.max(0, startSearch);
    const safeEnd = Math.min(allWords.length, endSearch);
    const isShortSnippet = spokenSnippet.length <= 2;

    for (let i = safeStart; i < safeEnd; i++) {
        let matches = 0;
        let scriptPointer = i;
        
        for (let j = 0; j < spokenSnippet.length; j++) {
            if (scriptPointer >= allWords.length) break;

            const spokenWord = spokenSnippet[j];
            const scriptWord = allWords[scriptPointer].clean;

            // Fuzzy Comparison Logic
            const dist = levenshtein(spokenWord, scriptWord);
            
            // Dynamic Tolerance Calculation
            const limit = scriptWord.length > 3 
                ? toleranceLevel 
                : (toleranceLevel >= 4 ? 1 : 0);

            const isMatch = dist <= limit;

            if (isMatch) {
                matches++;
                scriptPointer++;
            } else {
                // Skip Logic (1 word skip tolerance)
                if (scriptPointer + 1 < allWords.length) {
                    const nextScriptWord = allWords[scriptPointer + 1].clean;
                    const nextDist = levenshtein(spokenWord, nextScriptWord);
                    
                    const nextLimit = nextScriptWord.length > 3 
                        ? toleranceLevel 
                        : (toleranceLevel >= 4 ? 1 : 0);
                    
                    if (nextDist <= nextLimit) {
                         matches += 0.8; 
                         scriptPointer += 2;
                         continue;
                    }
                }
                
                if (isShortSnippet) {
                    matches = 0; 
                    break; 
                }
                scriptPointer++; 
            }
        }
        
        const score = matches / spokenSnippet.length;

        if (score > bestScore) {
            bestScore = score;
            bestIndex = Math.min(scriptPointer - 1, allWords.length - 1);
        }
    }
    return { score: bestScore, index: bestIndex };
};
