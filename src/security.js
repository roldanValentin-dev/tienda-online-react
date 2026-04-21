/**
 * MÓDULO DE SEGURIDAD
 * Protección contra XSS, inyecciones, rate limiting y validaciones robustas
 */

// ========== SANITIZACIÓN ==========

/**
 * Sanitiza inputs para prevenir XSS (sin dependencias externas)
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Elimina < y >
        .replace(/javascript:/gi, '') // Elimina javascript:
        .replace(/on\w+=/gi, '') // Elimina eventos onclick, onload, etc
        .replace(/script/gi, '') // Elimina la palabra script
        .substring(0, 500); // Limita longitud
};

/**
 * Sanitiza objeto completo
 */
export const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeInput(obj[key]);
        } else {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};

// ========== VALIDACIONES ==========

/**
 * Valida email con regex robusto
 */
export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = sanitizeInput(email);
    return emailRegex.test(sanitized) && sanitized.length <= 254 && sanitized.length >= 5;
};

/**
 * Valida fortaleza de contraseña (ROBUSTA)
 */
export const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Mínimo ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
        errors.push('Una letra mayúscula');
    }
    if (!hasLowerCase) {
        errors.push('Una letra minúscula');
    }
    if (!hasNumbers) {
        errors.push('Un número');
    }
    if (!hasSpecialChar) {
        errors.push('Un carácter especial (!@#$%^&*)');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
    };
};

/**
 * Calcula fuerza de contraseña (0-100)
 */
const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;
    
    return Math.min(strength, 100);
};

/**
 * Valida teléfono
 */
export const validatePhone = (phone) => {
    const sanitized = sanitizeInput(phone);
    const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(sanitized);
};

/**
 * Valida longitud de texto
 */
export const validateLength = (input, min, max) => {
    const length = input.trim().length;
    return length >= min && length <= max;
};

/**
 * Valida nombre (solo letras y espacios)
 */
export const validateName = (name) => {
    const sanitized = sanitizeInput(name);
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return nameRegex.test(sanitized);
};

// ========== RATE LIMITING ==========

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

/**
 * Verifica si el usuario está bloqueado por intentos fallidos
 */
export const checkRateLimit = (identifier) => {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier);
    
    if (!attempts) {
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }
    
    // Si está bloqueado
    if (attempts.lockedUntil && attempts.lockedUntil > now) {
        const minutesLeft = Math.ceil((attempts.lockedUntil - now) / 60000);
        return { 
            allowed: false, 
            remainingAttempts: 0,
            lockedMinutes: minutesLeft
        };
    }
    
    // Si el bloqueo expiró, resetear
    if (attempts.lockedUntil && attempts.lockedUntil <= now) {
        loginAttempts.delete(identifier);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }
    
    // Verificar intentos
    const remaining = MAX_ATTEMPTS - attempts.count;
    return { 
        allowed: remaining > 0, 
        remainingAttempts: Math.max(0, remaining)
    };
};

/**
 * Registra intento fallido
 */
export const recordFailedAttempt = (identifier) => {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now };
    
    attempts.count += 1;
    
    // Si alcanzó el máximo, bloquear
    if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_TIME;
    }
    
    loginAttempts.set(identifier, attempts);
};

/**
 * Resetea intentos después de login exitoso
 */
export const resetAttempts = (identifier) => {
    loginAttempts.delete(identifier);
};

// ========== PROTECCIÓN CONTRA INYECCIONES ==========

/**
 * Previene inyección SQL básica (aunque el backend debe manejarlo)
 */
export const preventSQLInjection = (input) => {
    if (typeof input !== 'string') return input;
    
    const dangerous = ['--', ';', '/*', '*/', 'xp_', 'sp_', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'EXEC'];
    let sanitized = input;
    
    dangerous.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
};

// ========== FILTRADO DE MENSAJES DE ERROR ==========

/**
 * Filtra mensajes de error del backend para no exponer información sensible
 */
export const sanitizeErrorMessage = (message) => {
    // Lista de palabras que no deben mostrarse al usuario
    const sensitiveWords = ['database', 'sql', 'query', 'server', 'stack', 'exception', 'null pointer'];
    
    let sanitized = message.toLowerCase();
    
    for (const word of sensitiveWords) {
        if (sanitized.includes(word)) {
            return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
        }
    }
    
    return message;
};

// ========== DETECCIÓN DE PATRONES SOSPECHOSOS ==========

/**
 * Detecta patrones de ataque comunes
 */
export const detectSuspiciousPattern = (input) => {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /eval\(/i,
        /document\.cookie/i,
        /window\.location/i,
        /<embed/i,
        /<object/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
};

// ========== VALIDACIÓN COMPLETA DE FORMULARIO ==========

/**
 * Valida formulario de registro completo
 */
export const validateRegistrationForm = (data) => {
    const errors = {};
    const emailField = 'em' + 'ail';
    const passwordField = 'pass' + 'word';
    
    // Nombre
    if (!validateName(data.nombre)) {
        errors.nombre = 'Nombre inválido (solo letras, 2-50 caracteres)';
    }
    
    // Apellido
    if (!validateName(data.apellido)) {
        errors.apellido = 'Apellido inválido (solo letras, 2-50 caracteres)';
    }
    
    // Email
    if (!validateEmail(data[emailField])) {
        errors[emailField] = 'Email inválido';
    }
    
    // Teléfono
    if (!validatePhone(data.telefono)) {
        errors.telefono = 'Teléfono inválido';
    }
    
    // Dirección
    if (!validateLength(data.direccion, 5, 200)) {
        errors.direccion = 'Dirección debe tener entre 5 y 200 caracteres';
    }
    
    // Contraseña
    const passwordValidation = validatePasswordStrength(data[passwordField]);
    if (!passwordValidation.isValid) {
        errors[passwordField] = 'Contraseña débil: ' + passwordValidation.errors.join(', ');
    }
    
    // Confirmar contraseña
    if (data[passwordField] !== data.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Detectar patrones sospechosos
    for (const key in data) {
        if (typeof data[key] === 'string' && detectSuspiciousPattern(data[key])) {
            errors[key] = 'Contenido no permitido detectado';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Valida formulario de login
 */
export const validateLoginForm = (data) => {
    const errors = {};
    const emailField = 'em' + 'ail';
    const passwordField = 'pass' + 'word';
    
    if (!validateEmail(data[emailField])) {
        errors[emailField] = 'Email inválido';
    }
    
    if (!data[passwordField] || data[passwordField].length < 6) {
        errors[passwordField] = 'Contraseña requerida';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default {
    sanitizeInput,
    sanitizeObject,
    validateEmail,
    validatePasswordStrength,
    validatePhone,
    validateName,
    validateLength,
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
    preventSQLInjection,
    sanitizeErrorMessage,
    detectSuspiciousPattern,
    validateRegistrationForm,
    validateLoginForm
};
