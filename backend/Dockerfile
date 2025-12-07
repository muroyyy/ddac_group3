FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

# Install AWS CLI v2 with timeout and retry
RUN apt-get update -qq && apt-get install -y --no-install-recommends curl unzip ca-certificates \
    && curl --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 5 \
       "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip -q awscliv2.zip \
    && ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli \
    && rm -rf awscliv2.zip aws/ \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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