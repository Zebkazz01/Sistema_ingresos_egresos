# 🚀 Guía de Despliegue en Vercel

## 📋 Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com) 
- Base de datos PostgreSQL (Supabase ya configurada)

## 🔧 Configuración de GitHub OAuth

### Paso 1: Actualizar GitHub OAuth App
1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Busca tu aplicación OAuth existente o crea una nueva
3. Actualiza las URLs:
   - **Homepage URL**: `https://prueba-fullstack-deploy-hph4emv1x.vercel.app`
   - **Authorization callback URL**: `https://prueba-fullstack-deploy-hph4emv1x.vercel.app/api/auth/callback/github`

### Paso 2: Variables de Entorno en Vercel
Configura estas variables en el dashboard de Vercel:

```env
DATABASE_URL=postgresql://postgres.nzxxxgfhhijpfifhjdmh:eWGcoi4Nkq3ipkXo@aws-1-us-west-1.pooler.supabase.com:5432/postgres
BETTER_AUTH_SECRET=Sc123456.
BETTER_AUTH_URL=https://prueba-fullstack-deploy-ra94pk4c0.vercel.app
GITHUB_CLIENT_ID=Ov23liA7wJWjbagkLRie
GITHUB_CLIENT_SECRET=95b4f1a0b3e3fb31be7669efe578c114128725d3
```

## 🚀 Despliegue

### Opción 1: Desde Vercel Dashboard
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno
5. Haz clic en "Deploy"

### Opción 2: Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Loguearse en Vercel  
vercel login

# Desplegar
vercel --prod
```

## ✅ Post-Despliegue
1. ✅ URL actualizada: `https://prueba-fullstack-deploy-ra94pk4c0.vercel.app`
2. Actualizar GitHub OAuth callback URL
3. Configurar variables de entorno en Vercel
4. Probar el flujo de autenticación
5. Verificar que todas las funcionalidades trabajen correctamente

## 🔍 Verificación
- ✅ Página de inicio carga correctamente
- ✅ Autenticación con GitHub funciona
- ✅ Dashboard muestra datos
- ✅ CRUD de movimientos funciona
- ✅ Gestión de usuarios funciona
- ✅ Reportes se generan correctamente
- ✅ Sistema de permisos y redirecciones funciona
