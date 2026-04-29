-- MoneyCouple — Initial Migration
-- Phase 2: All tables, enums, and indexes

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "TipoCuenta" AS ENUM ('INDIVIDUAL', 'PAREJA');
CREATE TYPE "EstadoPareja" AS ENUM ('ACTIVA', 'PAUSADA', 'SEPARADA');
CREATE TYPE "TipoDivision" AS ENUM ('POR_INGRESOS', 'CINCUENTA_CINCUENTA', 'CUSTOM');
CREATE TYPE "NivelTransparencia" AS ENUM ('COMPLETO', 'PARCIAL', 'MINIMO');
CREATE TYPE "CategoriaGasto" AS ENUM (
  'COMIDA', 'TRANSPORTE', 'ENTRETENIMIENTO', 'SERVICIOS', 'COMPRAS',
  'SALUD', 'EDUCACION', 'VIAJES', 'HOGAR', 'MASCOTAS', 'REGALOS',
  'IMPUESTOS', 'OTROS'
);
CREATE TYPE "TipoGasto" AS ENUM ('PERSONAL', 'COMPARTIDO', 'ADELANTO', 'REEMBOLSO');
CREATE TYPE "NivelPrivacidad" AS ENUM ('COMPLETO', 'CATEGORIA_SOLO', 'OCULTO');
CREATE TYPE "FuenteRegistro" AS ENUM ('FOTO_GEMMA', 'CHAT', 'VOZ', 'MANUAL', 'IMPORTADO', 'RECURRENTE');
CREATE TYPE "TipoCartera" AS ENUM (
  'BILLETERA_DIGITAL', 'BANCO_AHORROS', 'BANCO_CORRIENTE',
  'TARJETA_CREDITO', 'TARJETA_DEBITO', 'EFECTIVO', 'INVERSION', 'CRIPTO', 'OTRO'
);
CREATE TYPE "TipoMeta" AS ENUM ('AHORRO', 'GASTO_LIMITE', 'INGRESO', 'DEUDA');
CREATE TYPE "EstadoMeta" AS ENUM ('ACTIVA', 'COMPLETADA', 'PAUSADA', 'CANCELADA');
CREATE TYPE "TipoNotificacion" AS ENUM (
  'GASTO_REGISTRADO', 'PAREJA_VINCULADA', 'META_ALCANZADA',
  'PRESUPUESTO_EXCEDIDO', 'RECORDATORIO_PAGO', 'GASTO_INUSUAL', 'RESUMEN_MENSUAL'
);

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE "Pareja" (
  "id"                  TEXT NOT NULL,
  "estado"              "EstadoPareja" NOT NULL DEFAULT 'ACTIVA',
  "fechaVinculacion"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaDesvinculacion" TIMESTAMP(3),
  "tipoDivision"        "TipoDivision" NOT NULL DEFAULT 'POR_INGRESOS',
  "porcentajeUsuario1"  DECIMAL(5,2),
  "porcentajeUsuario2"  DECIMAL(5,2),
  "presupuestoMensual"  DECIMAL(15,2),
  "nivelTransparencia"  "NivelTransparencia" NOT NULL DEFAULT 'COMPLETO',
  "codigoVinculacion"   TEXT,
  "codigoExpiracion"    TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Pareja_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Pareja_codigoVinculacion_key" ON "Pareja"("codigoVinculacion");

CREATE TABLE "User" (
  "id"                    TEXT NOT NULL,
  "email"                 TEXT NOT NULL,
  "clerkId"               TEXT,
  "nombre"                TEXT NOT NULL,
  "apellido"              TEXT,
  "fotoPerfil"            TEXT,
  "fechaNacimiento"       TIMESTAMP(3),
  "tipoCuenta"            "TipoCuenta" NOT NULL DEFAULT 'INDIVIDUAL',
  "parejaId"              TEXT,
  "monedaDefault"         TEXT NOT NULL DEFAULT 'COP',
  "idioma"                TEXT NOT NULL DEFAULT 'es',
  "modoOscuro"            BOOLEAN NOT NULL DEFAULT false,
  "configPrivacidad"      JSONB,
  "ingresoMensual"        DECIMAL(15,2),
  "monedaIngreso"         TEXT,
  "ingresoActualizado"    TIMESTAMP(3),
  "mostrarIngresoAPareja" BOOLEAN NOT NULL DEFAULT true,
  "esPremium"             BOOLEAN NOT NULL DEFAULT false,
  "premiumHasta"          TIMESTAMP(3),
  "stripeCustomerId"      TEXT,
  "emailVerificado"       BOOLEAN NOT NULL DEFAULT false,
  "ultimoLogin"           TIMESTAMP(3),
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL,
  "deletedAt"             TIMESTAMP(3),

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX "User_parejaId_idx" ON "User"("parejaId");

ALTER TABLE "User"
  ADD CONSTRAINT "User_parejaId_fkey"
  FOREIGN KEY ("parejaId") REFERENCES "Pareja"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Cartera" (
  "id"               TEXT NOT NULL,
  "usuarioId"        TEXT NOT NULL,
  "nombre"           TEXT NOT NULL,
  "tipo"             "TipoCartera" NOT NULL,
  "saldoActual"      DECIMAL(15,2) NOT NULL,
  "saldoInicial"     DECIMAL(15,2) NOT NULL,
  "moneda"           TEXT NOT NULL DEFAULT 'COP',
  "limiteCredito"    DECIMAL(15,2),
  "diaCorte"         INTEGER,
  "diaPago"          INTEGER,
  "icono"            TEXT NOT NULL,
  "color"            TEXT NOT NULL,
  "numeroEnmascarado" TEXT,
  "activa"           BOOLEAN NOT NULL DEFAULT true,
  "esCompartida"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Cartera_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Cartera_usuarioId_idx" ON "Cartera"("usuarioId");

ALTER TABLE "Cartera"
  ADD CONSTRAINT "Cartera_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Gasto" (
  "id"                   TEXT NOT NULL,
  "usuarioId"            TEXT NOT NULL,
  "parejaId"             TEXT,
  "monto"                DECIMAL(15,2) NOT NULL,
  "moneda"               TEXT NOT NULL DEFAULT 'COP',
  "descripcion"          TEXT,
  "categoria"            "CategoriaGasto" NOT NULL,
  "subcategoria"         TEXT,
  "establecimiento"      TEXT,
  "ubicacion"            JSONB,
  "fechaGasto"           TIMESTAMP(3) NOT NULL,
  "tipoGasto"            "TipoGasto" NOT NULL DEFAULT 'PERSONAL',
  "esCompartido"         BOOLEAN NOT NULL DEFAULT false,
  "quienGasta"           TEXT,
  "esPrivado"            BOOLEAN NOT NULL DEFAULT false,
  "nivelPrivacidad"      "NivelPrivacidad" NOT NULL DEFAULT 'COMPLETO',
  "items"                JSONB,
  "carteraId"            TEXT,
  "fuenteRegistro"       "FuenteRegistro" NOT NULL,
  "confianzaIA"          DECIMAL(3,2),
  "necesitaConfirmacion" BOOLEAN NOT NULL DEFAULT false,
  "confirmadoPorUsuario" BOOLEAN NOT NULL DEFAULT false,
  "fotoOriginalUrl"      TEXT,
  "fotoProcesadaUrl"     TEXT,
  "audioUrl"             TEXT,
  "etiquetas"            TEXT[] NOT NULL DEFAULT '{}',
  "notas"                TEXT,
  "esRecurrente"         BOOLEAN NOT NULL DEFAULT false,
  "frecuenciaRecurrencia" TEXT,
  "proximoGasto"         TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  "deletedAt"            TIMESTAMP(3),

  CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Gasto_usuarioId_idx" ON "Gasto"("usuarioId");
CREATE INDEX "Gasto_parejaId_idx" ON "Gasto"("parejaId");
CREATE INDEX "Gasto_fechaGasto_idx" ON "Gasto"("fechaGasto");
CREATE INDEX "Gasto_categoria_idx" ON "Gasto"("categoria");
CREATE INDEX "Gasto_carteraId_idx" ON "Gasto"("carteraId");

ALTER TABLE "Gasto"
  ADD CONSTRAINT "Gasto_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Gasto"
  ADD CONSTRAINT "Gasto_parejaId_fkey"
  FOREIGN KEY ("parejaId") REFERENCES "Pareja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Gasto"
  ADD CONSTRAINT "Gasto_carteraId_fkey"
  FOREIGN KEY ("carteraId") REFERENCES "Cartera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Division" (
  "id"                     TEXT NOT NULL,
  "parejaId"               TEXT NOT NULL,
  "mes"                    TEXT NOT NULL,
  "ingresoUsuario1"        DECIMAL(15,2) NOT NULL,
  "ingresoUsuario2"        DECIMAL(15,2) NOT NULL,
  "porcentajeUsuario1"     DECIMAL(5,2) NOT NULL,
  "porcentajeUsuario2"     DECIMAL(5,2) NOT NULL,
  "totalGastosCompartidos" DECIMAL(15,2) NOT NULL,
  "usuario1DebePagar"      DECIMAL(15,2) NOT NULL,
  "usuario2DebePagar"      DECIMAL(15,2) NOT NULL,
  "usuario1YaPago"         DECIMAL(15,2) NOT NULL,
  "usuario2YaPago"         DECIMAL(15,2) NOT NULL,
  "balanceUsuario1"        DECIMAL(15,2) NOT NULL,
  "balanceUsuario2"        DECIMAL(15,2) NOT NULL,
  "deudorId"               TEXT,
  "acreedorId"             TEXT,
  "montoDebido"            DECIMAL(15,2),
  "saldado"                BOOLEAN NOT NULL DEFAULT false,
  "pagos"                  JSONB,
  "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"              TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Division_parejaId_mes_key" ON "Division"("parejaId", "mes");
CREATE INDEX "Division_parejaId_idx" ON "Division"("parejaId");

ALTER TABLE "Division"
  ADD CONSTRAINT "Division_parejaId_fkey"
  FOREIGN KEY ("parejaId") REFERENCES "Pareja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Meta" (
  "id"              TEXT NOT NULL,
  "usuarioId"       TEXT,
  "parejaId"        TEXT,
  "titulo"          TEXT NOT NULL,
  "descripcion"     TEXT,
  "tipo"            "TipoMeta" NOT NULL,
  "montoObjetivo"   DECIMAL(15,2) NOT NULL,
  "montoActual"     DECIMAL(15,2) NOT NULL DEFAULT 0,
  "moneda"          TEXT NOT NULL DEFAULT 'COP',
  "fechaInicio"     TIMESTAMP(3) NOT NULL,
  "fechaFin"        TIMESTAMP(3),
  "categoriaLimite" "CategoriaGasto",
  "estado"          "EstadoMeta" NOT NULL DEFAULT 'ACTIVA',
  "icono"           TEXT,
  "color"           TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Meta_usuarioId_idx" ON "Meta"("usuarioId");
CREATE INDEX "Meta_parejaId_idx" ON "Meta"("parejaId");

ALTER TABLE "Meta"
  ADD CONSTRAINT "Meta_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Meta"
  ADD CONSTRAINT "Meta_parejaId_fkey"
  FOREIGN KEY ("parejaId") REFERENCES "Pareja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Notificacion" (
  "id"        TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tipo"      "TipoNotificacion" NOT NULL,
  "titulo"    TEXT NOT NULL,
  "mensaje"   TEXT NOT NULL,
  "data"      JSONB,
  "leida"     BOOLEAN NOT NULL DEFAULT false,
  "leidaEn"   TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notificacion_usuarioId_idx" ON "Notificacion"("usuarioId");
CREATE INDEX "Notificacion_leida_idx" ON "Notificacion"("leida");

ALTER TABLE "Notificacion"
  ADD CONSTRAINT "Notificacion_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Sesion" (
  "id"           TEXT NOT NULL,
  "usuarioId"    TEXT NOT NULL,
  "token"        TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "dispositivo"  TEXT,
  "ipAddress"    TEXT,
  "userAgent"    TEXT,
  "expiresAt"    TIMESTAMP(3) NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Sesion_token_key" ON "Sesion"("token");
CREATE UNIQUE INDEX "Sesion_refreshToken_key" ON "Sesion"("refreshToken");
CREATE INDEX "Sesion_token_idx" ON "Sesion"("token");
CREATE INDEX "Sesion_refreshToken_idx" ON "Sesion"("refreshToken");

ALTER TABLE "Sesion"
  ADD CONSTRAINT "Sesion_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
