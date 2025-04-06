{ pkgs }: {
  deps = [
    pkgs.python39
    pkgs.python39Packages.pip
    pkgs.sqlite
    pkgs.gcc
    pkgs.gnumake
  ];
  env = {
    PYTHONBIN = "${pkgs.python39}/bin/python3.9";
    LANG = "en_US.UTF-8";
  };
}
