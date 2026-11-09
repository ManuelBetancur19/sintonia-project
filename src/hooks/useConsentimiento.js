// RESPONSABILIDAD: Sincroniza el estado React con el consentimiento almacenado.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  aceptarConsentimiento,
  leerConsentimiento,
  obtenerConsentimientoCrudo,
  rechazarConsentimiento,
  suscribirseAConsentimiento,
} from "../utils/consentimiento.js";

// Valor del consentimiento en el servidor: no hay decisión disponible.
const SNAPSHOT_SERVIDOR = null;

export function useConsentimiento() {
  // [LOCAL] Se suscribe a cambios de cookie sin crear objetos nuevos en cada lectura.
  const consentimientoCrudo = useSyncExternalStore(
    suscribirseAConsentimiento,
    obtenerConsentimientoCrudo,
    () => SNAPSHOT_SERVIDOR,
  );
  // Interpreta el consentimiento solo cuando cambia su valor crudo.
  const consentimiento = useMemo(
    () => leerConsentimiento(consentimientoCrudo),
    [consentimientoCrudo],
  );

  // Acciones estables para registrar la decisión de la persona.
  const aceptar = useCallback(() => aceptarConsentimiento(), []);
  const rechazar = useCallback(() => rechazarConsentimiento(), []);

  return {
    // Indica si ya existe una decisión de consentimiento.
    decidido: consentimiento !== null,
    // Muestra null mientras no haya decisión.
    categorias: consentimiento?.categorias ?? null,
    aceptar,
    rechazar,
  };
}