{pkgs}: {
  channel = "stable-24.11"; # o "unstable" para paquetes más nuevos
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    # Añade estas nuevas dependencias gratuitas
    pkgs.sqlite
    pkgs.supabase-cli
  ];

  env = {
    # Variables para Supabase local
    NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    NEXT_PUBLIC_SUPABASE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...";
  };

  # Configuración alternativa a Firebase Emulators
  # services.supabase = {
  #   enable = true;
  #   localMode = true;
  # };

  idx = {
    extensions = [
      # Extensiones recomendadas para desarrollo
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];

    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
