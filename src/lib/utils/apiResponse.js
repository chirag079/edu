export class ApiResponse {
  constructor(data, message = "Success", statusCode = 200) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = "Success", statusCode = 200) {
    return new ApiResponse(data, message, statusCode);
  }

  static error(message = "Error", statusCode = 500) {
    return new ApiResponse(null, message, statusCode);
  }

  static paginated(data, pagination, message = "Success") {
    return new ApiResponse(
      {
        data,
        pagination,
      },
      message
    );
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode,
    };
  }
}

export const sendResponse = (res, response) => {
  return res.status(response.statusCode).json(response.toJSON());
};

export const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = data.length;

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: endIndex < total,
      hasPreviousPage: startIndex > 0,
    },
  };
};

export const filterData = (data, filters) => {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (typeof value === "string") {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      return item[key] === value;
    });
  });
};

export const sortData = (data, sortBy, order = "asc") => {
  return data.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (order === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });
};

export const searchData = (data, searchTerm, searchFields) => {
  if (!searchTerm) return data;

  return data.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field];
      if (!value) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
};
