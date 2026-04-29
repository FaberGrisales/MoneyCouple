/**
 * MoneyCouple — Seed script
 * Populates the database with realistic Colombian test data:
 *   5 users · 2 couples · wallets · 60+ transactions · goals · divisions
 *
 * Run: pnpm db:seed  (from repo root or packages/database)
 */

import { PrismaClient } from '../generated/prisma-client';
import { connectMongo, disconnectMongo } from './mongodb/connection';
import { AnalisisIA } from './mongodb/schemas/analisis-ia.schema';

// ─── Load .env from repo root ──────────────────────────────────────────────
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Helpers ───────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 20) + 7, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.info('\n🌱  MoneyCouple seed starting...\n');

  // Connect MongoDB for AI samples
  try {
    await connectMongo(process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/moneycouple_ia');
    console.info('✓  MongoDB connected');
  } catch {
    console.warn('⚠   MongoDB not available — skipping AI samples');
  }

  // ── Clean existing data ───────────────────────────────────────────────────
  console.info('🧹  Cleaning existing data...');
  await prisma.notificacion.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.division.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.cartera.deleteMany();
  await prisma.$executeRaw`UPDATE "User" SET "parejaId" = NULL`;
  await prisma.pareja.deleteMany();
  await prisma.user.deleteMany();
  await AnalisisIA.deleteMany({}).catch(() => null);

  // ── Users ─────────────────────────────────────────────────────────────────
  console.info('👤  Creating users...');

  const juan = await prisma.user.create({
    data: {
      email: 'juan@moneycouple.co',
      nombre: 'Juan',
      apellido: 'Martínez',
      tipoCuenta: 'PAREJA',
      monedaDefault: 'COP',
      ingresoMensual: 5_800_000,
      emailVerificado: true,
      esPremium: true,
      premiumHasta: new Date('2026-12-31'),
      ultimoLogin: daysAgo(0),
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: 'maria@moneycouple.co',
      nombre: 'María',
      apellido: 'Rodríguez',
      tipoCuenta: 'PAREJA',
      monedaDefault: 'COP',
      ingresoMensual: 4_200_000,
      emailVerificado: true,
      esPremium: true,
      premiumHasta: new Date('2026-12-31'),
      ultimoLogin: daysAgo(1),
    },
  });

  const sebastian = await prisma.user.create({
    data: {
      email: 'sebastian@moneycouple.co',
      nombre: 'Sebastián',
      apellido: 'López',
      tipoCuenta: 'PAREJA',
      monedaDefault: 'COP',
      ingresoMensual: 6_500_000,
      emailVerificado: true,
      ultimoLogin: daysAgo(2),
    },
  });

  const laura = await prisma.user.create({
    data: {
      email: 'laura@moneycouple.co',
      nombre: 'Laura',
      apellido: 'García',
      tipoCuenta: 'PAREJA',
      monedaDefault: 'COP',
      ingresoMensual: 5_100_000,
      emailVerificado: true,
      ultimoLogin: daysAgo(1),
    },
  });

  const carlos = await prisma.user.create({
    data: {
      email: 'carlos@moneycouple.co',
      nombre: 'Carlos',
      apellido: 'Hernández',
      tipoCuenta: 'INDIVIDUAL',
      monedaDefault: 'COP',
      ingresoMensual: 3_800_000,
      emailVerificado: true,
      ultimoLogin: daysAgo(3),
    },
  });

  console.info('   ✓ Juan, María, Sebastián, Laura, Carlos');

  // ── Parejas ───────────────────────────────────────────────────────────────
  console.info('💑  Creating couples...');

  const parejaJuanMaria = await prisma.pareja.create({
    data: {
      estado: 'ACTIVA',
      fechaVinculacion: new Date('2025-01-15'),
      tipoDivision: 'POR_INGRESOS',
      porcentajeUsuario1: 58,
      porcentajeUsuario2: 42,
      presupuestoMensual: 3_500_000,
      nivelTransparencia: 'COMPLETO',
      usuarios: { connect: [{ id: juan.id }, { id: maria.id }] },
    },
  });

  const parejaSebastianLaura = await prisma.pareja.create({
    data: {
      estado: 'ACTIVA',
      fechaVinculacion: new Date('2025-06-01'),
      tipoDivision: 'CINCUENTA_CINCUENTA',
      porcentajeUsuario1: 50,
      porcentajeUsuario2: 50,
      presupuestoMensual: 4_000_000,
      nivelTransparencia: 'PARCIAL',
      usuarios: { connect: [{ id: sebastian.id }, { id: laura.id }] },
    },
  });

  await prisma.user.update({ where: { id: juan.id }, data: { parejaId: parejaJuanMaria.id } });
  await prisma.user.update({ where: { id: maria.id }, data: { parejaId: parejaJuanMaria.id } });
  await prisma.user.update({
    where: { id: sebastian.id },
    data: { parejaId: parejaSebastianLaura.id },
  });
  await prisma.user.update({
    where: { id: laura.id },
    data: { parejaId: parejaSebastianLaura.id },
  });

  console.info('   ✓ Juan+María (por ingresos 58/42), Sebastián+Laura (50/50)');

  // ── Carteras ──────────────────────────────────────────────────────────────
  console.info('👛  Creating wallets...');

  const carterasJuan = await Promise.all([
    prisma.cartera.create({
      data: {
        usuarioId: juan.id,
        nombre: 'Nequi',
        tipo: 'BILLETERA_DIGITAL',
        saldoActual: 487_300,
        saldoInicial: 0,
        icono: 'nequi',
        color: '#7B0F73',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: juan.id,
        nombre: 'Bancolombia Ahorros',
        tipo: 'BANCO_AHORROS',
        saldoActual: 1_547_800,
        saldoInicial: 800_000,
        icono: 'bancolombia',
        color: '#FFCC00',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: juan.id,
        nombre: 'Visa Creditodo',
        tipo: 'TARJETA_CREDITO',
        saldoActual: -312_000,
        saldoInicial: 0,
        limiteCredito: 5_000_000,
        diaCorte: 25,
        diaPago: 10,
        icono: 'visa',
        color: '#1A1F71',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: juan.id,
        nombre: 'Efectivo',
        tipo: 'EFECTIVO',
        saldoActual: 85_000,
        saldoInicial: 0,
        icono: 'cash',
        color: '#10B981',
      },
    }),
  ]);

  const carterasMaria = await Promise.all([
    prisma.cartera.create({
      data: {
        usuarioId: maria.id,
        nombre: 'Daviplata',
        tipo: 'BILLETERA_DIGITAL',
        saldoActual: 234_500,
        saldoInicial: 0,
        icono: 'daviplata',
        color: '#E1141B',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: maria.id,
        nombre: 'Davivienda Ahorros',
        tipo: 'BANCO_AHORROS',
        saldoActual: 892_400,
        saldoInicial: 500_000,
        icono: 'davivienda',
        color: '#E1141B',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: maria.id,
        nombre: 'Mastercard Débito',
        tipo: 'TARJETA_DEBITO',
        saldoActual: 1_200_000,
        saldoInicial: 1_200_000,
        icono: 'mastercard',
        color: '#EB001B',
      },
    }),
  ]);

  const carterasSebastian = await Promise.all([
    prisma.cartera.create({
      data: {
        usuarioId: sebastian.id,
        nombre: 'Nequi',
        tipo: 'BILLETERA_DIGITAL',
        saldoActual: 650_000,
        saldoInicial: 0,
        icono: 'nequi',
        color: '#7B0F73',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: sebastian.id,
        nombre: 'Bancolombia Corriente',
        tipo: 'BANCO_CORRIENTE',
        saldoActual: 2_300_000,
        saldoInicial: 1_000_000,
        icono: 'bancolombia',
        color: '#FFCC00',
      },
    }),
  ]);

  const carterasCarlos = await Promise.all([
    prisma.cartera.create({
      data: {
        usuarioId: carlos.id,
        nombre: 'Nequi',
        tipo: 'BILLETERA_DIGITAL',
        saldoActual: 180_000,
        saldoInicial: 0,
        icono: 'nequi',
        color: '#7B0F73',
      },
    }),
    prisma.cartera.create({
      data: {
        usuarioId: carlos.id,
        nombre: 'Bancolombia',
        tipo: 'BANCO_AHORROS',
        saldoActual: 340_000,
        saldoInicial: 200_000,
        icono: 'bancolombia',
        color: '#FFCC00',
      },
    }),
  ]);

  console.info('   ✓ 11 wallets (Nequi, Bancolombia, Daviplata, Davivienda, Visa, Mastercard...)');

  // ── Gastos ────────────────────────────────────────────────────────────────
  console.info('💸  Creating transactions (60+)...');

  type CatEnum =
    | 'COMIDA'
    | 'TRANSPORTE'
    | 'ENTRETENIMIENTO'
    | 'SERVICIOS'
    | 'COMPRAS'
    | 'SALUD'
    | 'EDUCACION'
    | 'VIAJES'
    | 'HOGAR'
    | 'MASCOTAS'
    | 'REGALOS'
    | 'IMPUESTOS'
    | 'OTROS';

  type GastoInput = {
    usuarioId: string;
    parejaId?: string;
    monto: number;
    descripcion?: string;
    categoria: CatEnum;
    establecimiento?: string;
    fechaGasto: Date;
    tipoGasto?: 'PERSONAL' | 'COMPARTIDO';
    esCompartido?: boolean;
    carteraId?: string;
    fuenteRegistro?: 'FOTO_GEMMA' | 'CHAT' | 'VOZ' | 'MANUAL' | 'IMPORTADO' | 'RECURRENTE';
    confianzaIA?: number;
    necesitaConfirmacion?: boolean;
    confirmadoPorUsuario?: boolean;
    esPrivado?: boolean;
    nivelPrivacidad?: 'COMPLETO' | 'CATEGORIA_SOLO' | 'OCULTO';
    etiquetas?: string[];
    subcategoria?: string;
    esRecurrente?: boolean;
    frecuenciaRecurrencia?: string;
  };

  const gastosBatch: GastoInput[] = [
    // ── Juan — Abril 2026 (presente)
    {
      usuarioId: juan.id,
      monto: 18_500,
      categoria: 'COMIDA',
      establecimiento: 'Juan Valdez',
      fechaGasto: daysAgo(1),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.96,
      confirmadoPorUsuario: true,
    },
    {
      usuarioId: juan.id,
      monto: 24_300,
      categoria: 'TRANSPORTE',
      establecimiento: 'Uber',
      fechaGasto: daysAgo(1),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'CHAT',
      confianzaIA: 0.99,
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 42_000,
      categoria: 'ENTRETENIMIENTO',
      establecimiento: 'Cine Colombia',
      fechaGasto: daysAgo(2),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 187_600,
      categoria: 'COMPRAS',
      establecimiento: 'Éxito Calle 72',
      fechaGasto: daysAgo(2),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.94,
      confirmadoPorUsuario: true,
    },
    {
      usuarioId: juan.id,
      monto: 9_500,
      categoria: 'COMIDA',
      establecimiento: 'Crepes & Waffles',
      fechaGasto: daysAgo(3),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: juan.id,
      monto: 85_000,
      categoria: 'SALUD',
      establecimiento: 'Drogas La Rebaja',
      fechaGasto: daysAgo(4),
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'MANUAL',
      subcategoria: 'Medicamentos',
    },
    {
      usuarioId: juan.id,
      monto: 15_000,
      categoria: 'TRANSPORTE',
      establecimiento: 'InDrive',
      fechaGasto: daysAgo(4),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 320_000,
      categoria: 'HOGAR',
      establecimiento: 'HomeCenter',
      fechaGasto: daysAgo(5),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      monto: 35_000,
      categoria: 'COMIDA',
      establecimiento: "Domino's Pizza",
      fechaGasto: daysAgo(6),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.91,
      confirmadoPorUsuario: true,
    },
    {
      usuarioId: juan.id,
      monto: 12_000,
      categoria: 'TRANSPORTE',
      establecimiento: 'Metro de Medellín',
      fechaGasto: daysAgo(7),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      monto: 149_000,
      categoria: 'SERVICIOS',
      establecimiento: 'Claro Colombia',
      fechaGasto: daysAgo(8),
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
      frecuenciaRecurrencia: 'MONTHLY',
    },
    {
      usuarioId: juan.id,
      monto: 55_000,
      categoria: 'EDUCACION',
      establecimiento: 'Platzi',
      fechaGasto: daysAgo(9),
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'IMPORTADO',
    },
    {
      usuarioId: juan.id,
      monto: 28_000,
      categoria: 'COMIDA',
      establecimiento: 'Starbucks',
      fechaGasto: daysAgo(10),
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.97,
      confirmadoPorUsuario: true,
    },

    // ── María — Abril 2026
    {
      usuarioId: maria.id,
      monto: 65_000,
      categoria: 'COMIDA',
      establecimiento: 'Mercado Paloquemao',
      fechaGasto: daysAgo(1),
      carteraId: carterasMaria[0]!.id,
      fuenteRegistro: 'VOZ',
      confianzaIA: 0.88,
    },
    {
      usuarioId: maria.id,
      monto: 180_000,
      categoria: 'COMPRAS',
      establecimiento: 'Zara Andino',
      fechaGasto: daysAgo(2),
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'MANUAL',
      esPrivado: true,
      nivelPrivacidad: 'OCULTO',
    },
    {
      usuarioId: maria.id,
      monto: 22_000,
      categoria: 'TRANSPORTE',
      establecimiento: 'Cabify',
      fechaGasto: daysAgo(3),
      carteraId: carterasMaria[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: maria.id,
      parejaId: parejaJuanMaria.id,
      monto: 95_000,
      categoria: 'COMIDA',
      establecimiento: 'Restaurante La Mar',
      fechaGasto: daysAgo(5),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.93,
    },
    {
      usuarioId: maria.id,
      monto: 45_000,
      categoria: 'SALUD',
      establecimiento: 'Sanitas',
      fechaGasto: daysAgo(6),
      carteraId: carterasMaria[1]!.id,
      fuenteRegistro: 'MANUAL',
      subcategoria: 'Consulta médica',
    },
    {
      usuarioId: maria.id,
      monto: 89_000,
      categoria: 'ENTRETENIMIENTO',
      establecimiento: 'Netflix · Disney+',
      fechaGasto: daysAgo(7),
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
      frecuenciaRecurrencia: 'MONTHLY',
    },
    {
      usuarioId: maria.id,
      monto: 35_500,
      categoria: 'COMIDA',
      establecimiento: 'Juan Valdez Gran Estación',
      fechaGasto: daysAgo(8),
      carteraId: carterasMaria[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.95,
    },
    {
      usuarioId: maria.id,
      monto: 250_000,
      categoria: 'EDUCACION',
      establecimiento: 'Pontificia Universidad Javeriana',
      fechaGasto: daysAgo(10),
      carteraId: carterasMaria[1]!.id,
      fuenteRegistro: 'MANUAL',
      subcategoria: 'Curso online',
    },

    // ── Juan — Marzo 2026
    {
      usuarioId: juan.id,
      monto: 42_800,
      categoria: 'COMIDA',
      establecimiento: "McDonald's",
      fechaGasto: daysAgo(15),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.98,
      confirmadoPorUsuario: true,
    },
    {
      usuarioId: juan.id,
      monto: 18_000,
      categoria: 'TRANSPORTE',
      establecimiento: 'Transmilenio',
      fechaGasto: daysAgo(16),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 780_000,
      categoria: 'VIAJES',
      establecimiento: 'Avianca',
      fechaGasto: daysAgo(18),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'MANUAL',
      subcategoria: 'Tiquetes Bogotá-Cartagena',
    },
    {
      usuarioId: juan.id,
      monto: 55_000,
      categoria: 'SALUD',
      establecimiento: 'Gym SmartFit',
      fechaGasto: daysAgo(20),
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
      frecuenciaRecurrencia: 'MONTHLY',
    },
    {
      usuarioId: juan.id,
      monto: 320_000,
      categoria: 'COMPRAS',
      establecimiento: 'Apple Store',
      fechaGasto: daysAgo(22),
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 145_000,
      categoria: 'COMIDA',
      establecimiento: 'Cevichería La Mar',
      fechaGasto: daysAgo(24),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[2]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: juan.id,
      monto: 8_500,
      categoria: 'TRANSPORTE',
      establecimiento: 'Bus SITP',
      fechaGasto: daysAgo(25),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      monto: 48_000,
      categoria: 'MASCOTAS',
      establecimiento: 'Vet Mascotas Felices',
      fechaGasto: daysAgo(27),
      carteraId: carterasJuan[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.89,
    },

    // ── María — Marzo 2026
    {
      usuarioId: maria.id,
      monto: 38_000,
      categoria: 'COMIDA',
      establecimiento: 'Wok Restaurante',
      fechaGasto: daysAgo(15),
      carteraId: carterasMaria[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.92,
    },
    {
      usuarioId: maria.id,
      monto: 95_000,
      categoria: 'COMPRAS',
      establecimiento: 'H&M Centro Mayor',
      fechaGasto: daysAgo(17),
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: maria.id,
      parejaId: parejaJuanMaria.id,
      monto: 650_000,
      categoria: 'VIAJES',
      establecimiento: 'Airbnb Cartagena',
      fechaGasto: daysAgo(19),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: maria.id,
      monto: 18_500,
      categoria: 'TRANSPORTE',
      establecimiento: 'Uber',
      fechaGasto: daysAgo(21),
      carteraId: carterasMaria[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: maria.id,
      monto: 75_000,
      categoria: 'SALUD',
      establecimiento: 'Óptica Colombiana',
      fechaGasto: daysAgo(23),
      carteraId: carterasMaria[1]!.id,
      fuenteRegistro: 'MANUAL',
    },

    // ── Sebastián — Abril 2026
    {
      usuarioId: sebastian.id,
      monto: 55_000,
      categoria: 'COMIDA',
      establecimiento: 'Andrés Carne de Res',
      fechaGasto: daysAgo(2),
      carteraId: carterasSebastian[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.95,
    },
    {
      usuarioId: sebastian.id,
      parejaId: parejaSebastianLaura.id,
      monto: 420_000,
      categoria: 'HOGAR',
      establecimiento: 'Ikea Bogotá',
      fechaGasto: daysAgo(4),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasSebastian[1]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: sebastian.id,
      monto: 280_000,
      categoria: 'EDUCACION',
      establecimiento: 'Udemy',
      fechaGasto: daysAgo(6),
      carteraId: carterasSebastian[1]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: sebastian.id,
      monto: 32_000,
      categoria: 'TRANSPORTE',
      establecimiento: 'InDrive',
      fechaGasto: daysAgo(7),
      carteraId: carterasSebastian[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: sebastian.id,
      parejaId: parejaSebastianLaura.id,
      monto: 185_000,
      categoria: 'ENTRETENIMIENTO',
      establecimiento: 'Club Nocturno Theatron',
      fechaGasto: daysAgo(9),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasSebastian[0]!.id,
      fuenteRegistro: 'MANUAL',
    },

    // ── Laura — Abril 2026
    {
      usuarioId: laura.id,
      monto: 48_000,
      categoria: 'COMIDA',
      establecimiento: 'Mercado Campesino',
      fechaGasto: daysAgo(1),
      fuenteRegistro: 'VOZ',
      confianzaIA: 0.87,
    },
    {
      usuarioId: laura.id,
      parejaId: parejaSebastianLaura.id,
      monto: 380_000,
      categoria: 'SERVICIOS',
      establecimiento: 'Gas Natural Fenosa',
      fechaGasto: daysAgo(3),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
    },
    {
      usuarioId: laura.id,
      monto: 125_000,
      categoria: 'SALUD',
      establecimiento: 'Clínica del Country',
      fechaGasto: daysAgo(5),
      fuenteRegistro: 'MANUAL',
      subcategoria: 'Exámenes',
    },
    {
      usuarioId: laura.id,
      monto: 85_000,
      categoria: 'COMPRAS',
      establecimiento: 'Sephora Andino',
      fechaGasto: daysAgo(7),
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.91,
    },

    // ── Carlos — Abril 2026
    {
      usuarioId: carlos.id,
      monto: 25_000,
      categoria: 'COMIDA',
      establecimiento: 'Frisby',
      fechaGasto: daysAgo(1),
      carteraId: carterasCarlos[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.97,
      confirmadoPorUsuario: true,
    },
    {
      usuarioId: carlos.id,
      monto: 85_000,
      categoria: 'SERVICIOS',
      establecimiento: 'ETB Internet',
      fechaGasto: daysAgo(3),
      carteraId: carterasCarlos[1]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
    },
    {
      usuarioId: carlos.id,
      monto: 45_000,
      categoria: 'ENTRETENIMIENTO',
      establecimiento: 'Netflix',
      fechaGasto: daysAgo(5),
      carteraId: carterasCarlos[0]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
    },
    {
      usuarioId: carlos.id,
      monto: 12_500,
      categoria: 'TRANSPORTE',
      establecimiento: 'Uber',
      fechaGasto: daysAgo(6),
      carteraId: carterasCarlos[0]!.id,
      fuenteRegistro: 'CHAT',
    },
    {
      usuarioId: carlos.id,
      monto: 140_000,
      categoria: 'COMPRAS',
      establecimiento: 'Alkosto',
      fechaGasto: daysAgo(8),
      carteraId: carterasCarlos[1]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: carlos.id,
      monto: 35_000,
      categoria: 'COMIDA',
      establecimiento: "McDonald's",
      fechaGasto: daysAgo(10),
      carteraId: carterasCarlos[0]!.id,
      fuenteRegistro: 'FOTO_GEMMA',
      confianzaIA: 0.98,
    },

    // ── Febrero 2026 (historial)
    {
      usuarioId: juan.id,
      monto: 195_000,
      categoria: 'IMPUESTOS',
      establecimiento: 'DIAN',
      fechaGasto: daysAgo(55),
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: juan.id,
      parejaId: parejaJuanMaria.id,
      monto: 2_100_000,
      categoria: 'HOGAR',
      establecimiento: 'Canon Apartamento',
      fechaGasto: daysAgo(58),
      tipoGasto: 'COMPARTIDO',
      esCompartido: true,
      carteraId: carterasJuan[1]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
      frecuenciaRecurrencia: 'MONTHLY',
    },
    {
      usuarioId: maria.id,
      monto: 280_000,
      categoria: 'REGALOS',
      establecimiento: 'Floristería Express',
      fechaGasto: daysAgo(60),
      carteraId: carterasMaria[2]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: carlos.id,
      monto: 520_000,
      categoria: 'COMPRAS',
      establecimiento: 'Falabella',
      fechaGasto: daysAgo(50),
      carteraId: carterasCarlos[1]!.id,
      fuenteRegistro: 'MANUAL',
    },
    {
      usuarioId: sebastian.id,
      monto: 1_800_000,
      categoria: 'HOGAR',
      establecimiento: 'Arriendo',
      fechaGasto: daysAgo(57),
      carteraId: carterasSebastian[1]!.id,
      fuenteRegistro: 'RECURRENTE',
      esRecurrente: true,
    },
  ];

  for (const g of gastosBatch) {
    await prisma.gasto.create({
      data: {
        usuarioId: g.usuarioId,
        parejaId: g.parejaId ?? null,
        monto: g.monto,
        moneda: 'COP',
        descripcion: g.descripcion ?? null,
        categoria: g.categoria,
        subcategoria: g.subcategoria ?? null,
        establecimiento: g.establecimiento ?? null,
        fechaGasto: g.fechaGasto,
        tipoGasto: g.tipoGasto ?? 'PERSONAL',
        esCompartido: g.esCompartido ?? false,
        esPrivado: g.esPrivado ?? false,
        nivelPrivacidad: g.nivelPrivacidad ?? 'COMPLETO',
        carteraId: g.carteraId ?? null,
        fuenteRegistro: g.fuenteRegistro ?? 'MANUAL',
        confianzaIA: g.confianzaIA ?? null,
        necesitaConfirmacion: g.necesitaConfirmacion ?? false,
        confirmadoPorUsuario: g.confirmadoPorUsuario ?? false,
        esRecurrente: g.esRecurrente ?? false,
        frecuenciaRecurrencia: g.frecuenciaRecurrencia ?? null,
        etiquetas: g.etiquetas ?? [],
      },
    });
  }

  console.info(`   ✓ ${gastosBatch.length} transactions created`);

  // ── Metas ─────────────────────────────────────────────────────────────────
  console.info('🎯  Creating goals...');

  await prisma.meta.create({
    data: {
      parejaId: parejaJuanMaria.id,
      titulo: 'Viaje a Cartagena',
      descripcion: 'Semana en Cartagena para aniversario — tiquetes + hotel + actividades',
      tipo: 'AHORRO',
      montoObjetivo: 3_000_000,
      montoActual: 1_840_000,
      fechaInicio: new Date('2026-01-01'),
      fechaFin: new Date('2026-07-15'),
      estado: 'ACTIVA',
      icono: '✈️',
      color: '#00D9A3',
    },
  });

  await prisma.meta.create({
    data: {
      usuarioId: juan.id,
      titulo: 'Fondo de emergencia',
      descripcion: '3 meses de gastos como fondo de emergencia',
      tipo: 'AHORRO',
      montoObjetivo: 5_000_000,
      montoActual: 2_035_100,
      fechaInicio: new Date('2025-12-01'),
      estado: 'ACTIVA',
      icono: '🛡️',
      color: '#6C5CE7',
    },
  });

  await prisma.meta.create({
    data: {
      usuarioId: juan.id,
      titulo: 'iPhone 16 Pro',
      descripcion: 'Ahorro para teléfono nuevo',
      tipo: 'AHORRO',
      montoObjetivo: 4_800_000,
      montoActual: 1_200_000,
      fechaInicio: new Date('2026-02-01'),
      fechaFin: new Date('2026-10-01'),
      estado: 'ACTIVA',
      icono: '📱',
      color: '#F59E0B',
    },
  });

  await prisma.meta.create({
    data: {
      usuarioId: carlos.id,
      titulo: 'Sin gastar en Compras — Mayo',
      descripcion: 'Mes sin compras no esenciales',
      tipo: 'GASTO_LIMITE',
      montoObjetivo: 0,
      montoActual: 0,
      categoriaLimite: 'COMPRAS',
      fechaInicio: new Date('2026-05-01'),
      fechaFin: new Date('2026-05-31'),
      estado: 'ACTIVA',
      icono: '🚫',
      color: '#FF6B6B',
    },
  });

  console.info('   ✓ 4 goals (Cartagena trip, emergency fund, iPhone, spending limit)');

  // ── Divisiones ────────────────────────────────────────────────────────────
  console.info('⚖️   Creating couple splits...');

  const gastosAbrilJuanMaria = await prisma.gasto.findMany({
    where: {
      parejaId: parejaJuanMaria.id,
      fechaGasto: { gte: new Date('2026-04-01') },
    },
  });
  const totalAbril = gastosAbrilJuanMaria.reduce((s, g) => s + Number(g.monto), 0);
  const ing1 = 5_800_000;
  const ing2 = 4_200_000;
  const totalIngresos = ing1 + ing2;
  const pct1 = ing1 / totalIngresos;
  const pct2 = ing2 / totalIngresos;

  await prisma.division.create({
    data: {
      parejaId: parejaJuanMaria.id,
      mes: '2026-04',
      ingresoUsuario1: ing1,
      ingresoUsuario2: ing2,
      porcentajeUsuario1: Math.round(pct1 * 100 * 100) / 100,
      porcentajeUsuario2: Math.round(pct2 * 100 * 100) / 100,
      totalGastosCompartidos: totalAbril,
      usuario1DebePagar: Math.round(totalAbril * pct1),
      usuario2DebePagar: Math.round(totalAbril * pct2),
      usuario1YaPago: Math.round(totalAbril * 0.65),
      usuario2YaPago: Math.round(totalAbril * 0.35),
      balanceUsuario1: Math.round(totalAbril * pct1 - totalAbril * 0.65),
      balanceUsuario2: Math.round(totalAbril * pct2 - totalAbril * 0.35),
      deudorId: juan.id,
      acreedorId: maria.id,
      montoDebido: 85_000,
      saldado: false,
    },
  });

  await prisma.division.create({
    data: {
      parejaId: parejaJuanMaria.id,
      mes: '2026-03',
      ingresoUsuario1: ing1,
      ingresoUsuario2: ing2,
      porcentajeUsuario1: Math.round(pct1 * 100 * 100) / 100,
      porcentajeUsuario2: Math.round(pct2 * 100 * 100) / 100,
      totalGastosCompartidos: 3_770_000,
      usuario1DebePagar: Math.round(3_770_000 * pct1),
      usuario2DebePagar: Math.round(3_770_000 * pct2),
      usuario1YaPago: 2_200_000,
      usuario2YaPago: 1_570_000,
      balanceUsuario1: 0,
      balanceUsuario2: 0,
      saldado: true,
    },
  });

  console.info('   ✓ 2 division records (April open, March settled)');

  // ── Notificaciones ────────────────────────────────────────────────────────
  console.info('🔔  Creating notifications...');

  const notifs = [
    {
      usuarioId: juan.id,
      tipo: 'GASTO_REGISTRADO' as const,
      titulo: 'Gasto registrado',
      mensaje: 'Gemma registró $18.500 en Juan Valdez desde tu foto',
      leida: false,
    },
    {
      usuarioId: juan.id,
      tipo: 'PRESUPUESTO_EXCEDIDO' as const,
      titulo: '¡Alerta presupuesto!',
      mensaje: 'Llevas el 75% del presupuesto de abril. Te quedan $875K',
      leida: false,
    },
    {
      usuarioId: juan.id,
      tipo: 'META_ALCANZADA' as const,
      titulo: '¡Gran avance!',
      mensaje: 'El Viaje a Cartagena ya está al 61% — ¡van por buen camino! 🎉',
      leida: true,
    },
    {
      usuarioId: maria.id,
      tipo: 'PAREJA_VINCULADA' as const,
      titulo: 'Juan te pagó',
      mensaje: 'Juan registró un pago de $85.000 para saldar su deuda de marzo',
      leida: false,
    },
    {
      usuarioId: maria.id,
      tipo: 'RESUMEN_MENSUAL' as const,
      titulo: 'Resumen de marzo',
      mensaje: 'Gastaron $5.2M en marzo. Comida fue la categoría principal (32%)',
      leida: true,
    },
    {
      usuarioId: carlos.id,
      tipo: 'GASTO_INUSUAL' as const,
      titulo: 'Gasto inusual detectado',
      mensaje: 'Gastaste $520K en Compras. Es 4x tu promedio semanal',
      leida: false,
    },
    {
      usuarioId: sebastian.id,
      tipo: 'GASTO_REGISTRADO' as const,
      titulo: 'Nuevo gasto compartido',
      mensaje: 'Laura registró $380K en servicios. Revisa la división del mes',
      leida: false,
    },
  ];

  for (const n of notifs) {
    await prisma.notificacion.create({ data: n });
  }

  console.info('   ✓ 7 notifications');

  // ── MongoDB AI Samples ────────────────────────────────────────────────────
  try {
    console.info('🤖  Creating AI analysis samples...');

    const gastosParaIA = await prisma.gasto.findMany({
      where: { fuenteRegistro: { in: ['FOTO_GEMMA', 'VOZ'] }, confianzaIA: { not: null } },
      take: 6,
    });

    for (const gasto of gastosParaIA) {
      await AnalisisIA.create({
        gastoId: gasto.id,
        usuarioId: gasto.usuarioId,
        tipo: gasto.fuenteRegistro === 'FOTO_GEMMA' ? 'factura' : 'voz',
        inputRaw:
          gasto.fuenteRegistro === 'VOZ'
            ? `"Gasté ${gasto.monto} en ${gasto.establecimiento}"`
            : undefined,
        resultadoBruto: {
          monto: Number(gasto.monto),
          comercio: gasto.establecimiento,
          categoria: gasto.categoria,
          confianza: Number(gasto.confianzaIA),
        },
        modeloUsado: 'gemini-2.0-flash',
        confianza: Number(gasto.confianzaIA),
        tiempoProcesamiento: Math.round(Math.random() * 2000 + 500),
        tokensUsados: Math.round(Math.random() * 800 + 200),
      });
    }

    console.info(`   ✓ ${gastosParaIA.length} AI analysis documents`);
  } catch {
    console.warn('   ⚠  Skipped (MongoDB not connected)');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.pareja.count(),
    prisma.cartera.count(),
    prisma.gasto.count(),
    prisma.meta.count(),
    prisma.notificacion.count(),
    prisma.division.count(),
  ]);

  console.info('\n✅  Seed complete!\n');
  console.info('   Users         :', counts[0]);
  console.info('   Couples       :', counts[1]);
  console.info('   Wallets       :', counts[2]);
  console.info('   Transactions  :', counts[3]);
  console.info('   Goals         :', counts[4]);
  console.info('   Notifications :', counts[5]);
  console.info('   Divisions     :', counts[6]);
  console.info('\n   Test users:');
  console.info('   juan@moneycouple.co / maria@moneycouple.co (pareja)');
  console.info('   sebastian@moneycouple.co / laura@moneycouple.co (pareja)');
  console.info('   carlos@moneycouple.co (individual)');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await disconnectMongo().catch(() => null);
  });
