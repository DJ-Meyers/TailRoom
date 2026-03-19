import { createContext } from "react";
import type { FieldConditions } from "~/types/field-conditions";

export type { FieldConditions } from "~/types/field-conditions";

interface CalcFieldConditionsContextValue {
  fieldConditionsState: FieldConditions;
  onChange: (patch: Partial<FieldConditions>) => void;
}

const CalcFieldConditionsContext = createContext<CalcFieldConditionsContextValue>({
  fieldConditionsState: {},
  onChange: () => {},
});

const CalcFieldConditionsProvider = CalcFieldConditionsContext.Provider;

export { CalcFieldConditionsContext, CalcFieldConditionsProvider };
export type { CalcFieldConditionsContextValue };
