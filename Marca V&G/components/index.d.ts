// V&G Proyectos y Servicios — sistema basado en clases CSS (components/bundle.css). No requiere React.
export interface BotonProps { variante?: 'primario' | 'secundario' | 'texto'; disabled?: boolean } // <button class="vg-btn vg-btn-primario">
export interface InsigniaProps { estado: 'planificacion' | 'ejecucion' | 'completado' | 'suspendido' } // <span class="vg-insignia vg-insignia-planificacion">
export interface TarjetaPresentacionProps { nombre: string; cargo: string; telefono: string; correo: string }
export interface MembreteProps { tipoDocumento: string; numero: string; fecha: string }
export interface RotuladoFlotaProps { unidad: string } // p. ej. "VG-014"
declare global { interface Window { VG: { clases: Record<string, Record<string, string>>; logos: Record<'blanco' | 'negro' | 'ambar' | 'original', string> } } }
