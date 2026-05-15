using System.Net;
using System.Text.Json;

namespace EmitScheduler.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try { await _next(context); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur non gérée : {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, message) = ex switch
        {
            KeyNotFoundException        => (HttpStatusCode.NotFound,            ex.Message),
            ArgumentException           => (HttpStatusCode.BadRequest,          ex.Message),
            InvalidOperationException   => (HttpStatusCode.Conflict,            ex.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized,        ex.Message),
            _                           => (HttpStatusCode.InternalServerError, "Une erreur interne est survenue.")
        };
        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)status;
        return context.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            status  = (int)status,
            error   = status.ToString(),
            message,
            path    = context.Request.Path.Value
        }));
    }
}

public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalErrorHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ErrorHandlingMiddleware>();
}
