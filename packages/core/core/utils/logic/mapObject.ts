type ValuesOf<T> = T[keyof T];

export function mapObjectValues<T extends {}, K>(
  objectToMap: T,
  mapObject: (arg0: ValuesOf<T>) => K
): { [key in keyof T]: K } {
  return Object.fromEntries(
    (Object.entries(objectToMap) as [string, ValuesOf<T>][]).map(
      ([key, value]: [string, ValuesOf<T>]) => [key, mapObject(value)]
    )
  ) as { [key in keyof T]: K };
}

const miObjeto = {
  nombre: "Juan",
  apellido: "Perez",
  edad: 30,
};

function miFuncion(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value + 1;
}

const miObjetoMapeado = mapObjectValues(miObjeto, miFuncion);

miObjetoMapeado;
