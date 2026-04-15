import { getStoredToken } from './auth-storage';

const normalizeBaseURL = (value) => {
  if (!value) {
    return 'http://localhost:3000';
  }

  return value
    .replace(/\/api-docs-json\/?$/, '')
    .replace(/\/api-docs\/?$/, '')
    .replace(/\/$/, '');
};

// Configuración base
const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL);

const parseErrorBody = async (response) => {
  try {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  if (globalThis.window === undefined) {
    return {};
  }

  const token = getStoredToken();
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const buildErrorMessage = (response, errorData) => {
  let message = response.statusText || `Error ${response.status}`;

  if (errorData != null) {
    if (typeof errorData === 'string') {
      message = errorData.trim() || message;
    } else if (errorData.message) {
      message = errorData.message;
    } else if (errorData.error) {
      message = errorData.error;
    } else if (Array.isArray(errorData) && errorData.length > 0) {
      try {
        const mapped = errorData
          .map((it) => (it && (it.message || it.defaultMessage || JSON.stringify(it))))
          .join(' | ');
        message = mapped || JSON.stringify(errorData);
      } catch {
        message = JSON.stringify(errorData);
      }
    } else {
      message = JSON.stringify(errorData);
    }
  }

  if (!message || message === '{}') {
    const statusSuffix = response.statusText ? ` - ${response.statusText}` : '';
    return `Error ${response.status}${statusSuffix}`;
  }

  return message;
};

const createApiError = (message, response, endpoint, errorData) => {
  const err = new Error(message);
  try {
    err.status = response.status;
    err.statusText = response.statusText;
    err.endpoint = endpoint;
    err.data = errorData;
  } catch {
    // ignore if attachment fails
  }

  return err;
};

const parseSuccessBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || !response.text) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const RESOURCE_ALIASES = {
  courses: 'course',
  careers: 'career',
  classrooms: 'classroom',
  professors: 'professor',
  students: 'student',
  roles: 'role',
  'schedule-configs': 'schedule-config',
  'generated-schedules': 'generated-schedule',
  'config-courses': 'config-course',
  'config-classrooms': 'config-classroom',
  'config-professors': 'config-professor',
  'student-grade': 'student-grades',
};

const swapEndpointAlias = (endpoint) => {
  const [path, query = ''] = String(endpoint).split('?');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return endpoint;
  }

  const lastSegment = segments.at(-1);
  const explicitReplacement = RESOURCE_ALIASES[lastSegment]
    || Object.entries(RESOURCE_ALIASES).find(([, singular]) => singular === lastSegment)?.[0];

  if (explicitReplacement) {
    segments[segments.length - 1] = explicitReplacement;
    const suffix = query ? '?' + query : '';
    return `/${segments.join('/')}${suffix}`;
  }

  const heuristicReplacement = lastSegment.endsWith('s') && lastSegment.length > 1
    ? lastSegment.slice(0, -1)
    : `${lastSegment}s`;

  if (heuristicReplacement === lastSegment) {
    return endpoint;
  }

  segments[segments.length - 1] = heuristicReplacement;
  const suffix = query ? '?' + query : '';
  return `/${segments.join('/')}${suffix}`;
};

const shouldRetryWithAlternateEndpoint = (response, endpoint, attempt) => {
  if (attempt > 0) return false;
  if (![404, 405].includes(response.status)) return false;

  return swapEndpointAlias(endpoint) !== endpoint;
};


// Función interna para hacer requests
const request = async (endpoint, method, data = null, customHeaders = {}, attempt = 0) => {
  const url = `${baseURL}${endpoint}`;

  console.info('[API Request]', {
    method,
    endpoint,
    url,
    hasBody: data != null,
    attempt,
  });
  
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...customHeaders,
  };

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    console.info('[API Response]', {
      method,
      endpoint,
      url,
      status: response.status,
      ok: response.ok,
      attempt,
    });

    if (!response.ok) {
      if (shouldRetryWithAlternateEndpoint(response, endpoint, attempt)) {
        const alternativeEndpoint = swapEndpointAlias(endpoint);
        return request(alternativeEndpoint, method, data, customHeaders, attempt + 1);
      }

      const errorData = await parseErrorBody(response.clone());
      const message = buildErrorMessage(response, errorData);

      console.error('Error API completo:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        errorData,
        fullError: message,
      });

      throw createApiError(message, response, url, errorData);
    }

    return parseSuccessBody(response);

  } catch (error) {
    if (!(error instanceof Error) || typeof error.status !== 'number') {
      console.error('Error en la solicitud:', error);
    }
    throw error;
  }
};

// Objeto API con métodos helper
const api = {
  get: (endpoint, options = {}) => {
    let url = endpoint;
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return request(url, 'GET', null, options.headers);
  },
  post: (endpoint, data, options = {}) => request(endpoint, 'POST', data, options.headers),
  put: (endpoint, data, options = {}) => request(endpoint, 'PUT', data, options.headers),
  patch: (endpoint, data, options = {}) => request(endpoint, 'PATCH', data, options.headers),
  delete: (endpoint, data = null, options = {}) => request(endpoint, 'DELETE', data, options.headers),
};

export default api;
