# Dominios

Es la primera capa de la arquitectura de la aplicación. Contiene las reglas básicas de negocio de la aplicación.

Definen como se deben manejar las operaciones.

Solo pueden comunicarse con otros elementos dentro de su propio dominio, con excepcion de `shared/domain` o `shared/utils`.
