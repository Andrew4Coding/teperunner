type EnvType = {
    BACKEND_URL: string;
};

export const ENV = {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
} as EnvType;
