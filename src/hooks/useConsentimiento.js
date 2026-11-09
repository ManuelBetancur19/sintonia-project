import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  aceptarConsentimiento,
  leerConsentimiento,
  obtenerConsentimientoCrudo,
  rechazarConsentimiento,
  suscribirseAConsentimiento,
} from "../utils/consentimiento.js";

const SNAPSHOT_SERVIDOR = null;

export function useConsentimiento() {
  const consentimientoCrudo = useSyncExternalStore(
    suscribirseAConsentimiento,
    obtenerConsentimientoCrudo,
    () => SNAPSHOT_SERVIDOR,
  );
  const consentimiento = useMemo(
    () => leerConsentimiento(consentimientoCrudo),
    [consentimientoCrudo],
  );

  const aceptar = useCallback(() => aceptarConsentimiento(), []);
  const rechazar = useCallback(() => rechazarConsentimiento(), []);

  return {
    decidido: consentimiento !== null,
    categorias: consentimiento?.categorias ?? null,
    aceptar,
    rechazar,
  };
}
