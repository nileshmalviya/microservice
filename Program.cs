using MassTransit;
using Microsoft.OpenApi.Models;
using System.Reflection;
using UserManagement.CQRS.Repositories.Implementation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddSingleton<JwtTokenHandler>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddMediatR(Assembly.GetExecutingAssembly());
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOTPRepository, OTPRepository>();
builder.Services.AddScoped<IUserInfoRepository, UserInfoRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    Options =>
    {
         Options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
         {
              Name = "Authorization",
              Type = SecuritySchemeType.ApiKey,
              Scheme = "Bearer",
              BearerFormat = "JWT",
              In = ParameterLocation.Header,
              Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
         });
         Options.AddSecurityRequirement(new OpenApiSecurityRequirement
         {
             {
                 new OpenApiSecurityScheme {
                     Reference= new OpenApiReference
                     {
                          Type =ReferenceType.SecurityScheme,
                          Id = "Bearer"
                     }
                  },
                  new string[] { }
              }
         });
    });
builder.Services.AddMassTransit(x =>
{
    x.AddBus(provider => Bus.Factory.CreateUsingRabbitMq(cfg =>
    {
        // configure health checks for this bus instance
        //cfg.UseHealthCheck(provider);

        cfg.Host("rabbitmq://localhost");

    }));
});
builder.Services.Configure<MassTransitHostOptions>(options =>
{
    options.WaitUntilStarted = true;
    options.StartTimeout = TimeSpan.FromSeconds(30);
    options.StopTimeout = TimeSpan.FromMinutes(1);
});


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromSeconds(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseAuthorization();
app.UseSession();
app.MapControllers();
app.Run();
