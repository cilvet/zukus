export function separateByEnclosingCharacters(
    input: string,
    openCharacter: string,
    closeCharacter: string
  ): string[] {
    let openCharacterCount = input.split(openCharacter).length - 1;
    let closeCharacterCount = input.split(closeCharacter).length - 1;
  
    if (openCharacterCount !== closeCharacterCount) {
      throw new Error(
        `The number of ${openCharacter} and ${closeCharacter} characters do not match,
         there are ${openCharacterCount} ${openCharacter} and ${closeCharacterCount} ${closeCharacter}.
         Input is: ${input}`
      );
    }
  
    let innerOpen = 0;
    let innerClosed = 0;
    const firstOpenIndex = input.indexOf(openCharacter);
  
    if (firstOpenIndex === -1) {
      return [input];
    }
  
    for (let i = firstOpenIndex + 1; i < input.length; i++) {
      if (input.charAt(i) === openCharacter) {
        innerOpen++;
      }
  
      if (input.charAt(i) === closeCharacter) {
        if (innerOpen === innerClosed) {
          return [
            input.substring(0, firstOpenIndex),
            input.substring(firstOpenIndex, i + 1),
            ...separateByEnclosingCharacters(
              input.substring(i + 1, input.length),
              openCharacter,
              closeCharacter
            ),
          ].filter(Boolean);
        } else {
          innerClosed++;
        }
      }
    }
    return [input];
  }
  
export function splitBySeparatorWithEnclosingChars(
  input: string,
  separator: string,
  openChar: string,
  closeChar: string
): string[] {
  const result: string[] = [];
  let currentPart = '';
  let nestedLevel = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === openChar) {
      nestedLevel++;
    } else if (char === closeChar) {
      nestedLevel--;
    }

    if (char === separator && nestedLevel === 0) {
      result.push(currentPart.trim());
      currentPart = '';
    } else {
      currentPart += char;
    }
  }

  if (currentPart.length > 0) {
    result.push(currentPart.trim());
  }

  return result;
}
  