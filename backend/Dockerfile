FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["BloodLine.csproj", "."]
RUN dotnet restore "BloodLine.csproj"
COPY . .
RUN dotnet build "BloodLine.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BloodLine.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BloodLine.dll"]