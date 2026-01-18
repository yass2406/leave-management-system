package com.polytech.app.api;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {
    
    @Override
    public Response toResponse(Exception exception) {
        String message = exception.getMessage();
        if (message == null) message = "Internal server error";
        
        return Response.status(getStatus(exception))
                .entity(new ErrorResponse(message))
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
    
    private int getStatus(Exception e) {
        if (e instanceof jakarta.ws.rs.BadRequestException) return 400;
        if (e instanceof jakarta.ws.rs.NotFoundException) return 404;
        if (e instanceof jakarta.ws.rs.ForbiddenException) return 403;
        return 500;
    }
}

class ErrorResponse {
    public String error;
    public ErrorResponse(String message) { this.error = message; }
}
