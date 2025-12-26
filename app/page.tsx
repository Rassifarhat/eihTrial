"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type RoleView = "anon" | "admin" | "doctor" | "staff";

type CardConfig = {
  label: string;
  href?: string;
  description?: string;
};

type RoleRow = {
  roles: { name: string } | null;
};

const doctorCards: CardConfig[] = [
  { label: "Visit dictation" },
  { label: "Voice translation", href: "/interpreter" },
  { label: "Requests filler", href: "/requests" },
  { label: "Surgical report", href: "/surgical_report" },
  { label: "Patient follow-up" },
  { label: "Medical reports" },
];

const adminCards: CardConfig[] = [
  {
    label: "Add user",
    href: "/protected/admin/users",
    description: "Create a new user and assign roles.",
  },
];

const getRoleView = (roles: string[]): RoleView => {
  if (roles.includes("admin")) {
    return "admin";
  }
  if (roles.includes("doctor")) {
    return "doctor";
  }
  if (roles.length) {
    return "staff";
  }
  return "anon";
};

export default function Page() {
  const [roleView, setRoleView] = useState<RoleView>("anon");

  useEffect(() => {
    const supabase = createClient();
    const loadRole = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setRoleView("anon");
        return;
      }

      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", data.user.id);

      if (roleError) {
        setRoleView("anon");
        return;
      }

      const roleNames = (roleRows as RoleRow[] | null)
        ?.map((row) => row.roles?.name)
        .filter((name): name is string => Boolean(name)) || [];

      setRoleView(getRoleView(roleNames));
    };

    void loadRole();
  }, []);

  const showCards = roleView !== "anon";
  const isInteractive = roleView === "doctor" || roleView === "admin";
  const cards = roleView === "admin" ? adminCards : doctorCards;

  return (
    <div
      style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "2.5rem 3rem",
          zIndex: 50,
        }}
      >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.8rem",
              marginBottom: "2.5rem",
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "2.0rem",
                fontWeight: "300",
                letterSpacing: "0.08em",
                margin: 0,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Emirates International Hospital
            </h1>
            <span
              style={{
                color: "#dc2626",
                fontSize: "1.4rem",
                fontWeight: "400",
                letterSpacing: "0.18em",
                textTransform: "lowercase",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              digital
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                minWidth: "260px",
                maxWidth: "280px",
                textAlign: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/eih.svg"
                alt="Emirates International Hospital Logo"
                style={{
                  width: "260px",
                  height: "auto",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 10,
                }}
              />

              <div
                style={{
                  color: "#dc2626",
                  fontSize: "3.5rem",
                  fontFamily: "var(--font-great-vibes), cursive",
                  fontWeight: "400",
                  letterSpacing: "0.05em",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                AI Twin
              </div>
            </div>

            {showCards ? (
              <div
                style={{
                  flex: 1,
                  height: "100%",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.18))",
                  backdropFilter: "blur(6px)",
                  boxShadow:
                    "0 14px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                    display: "grid",
                    gridTemplateColumns:
                      roleView === "admin"
                        ? "repeat(1, minmax(0, 1fr))"
                        : "repeat(3, minmax(0, 1fr))",
                    gridAutoRows: "1fr",
                    gap: "1.2rem",
                    alignContent: "stretch",
                    justifyItems: "stretch",
                  }}
                >
                  {cards.map((card, idx) => {
                    const description =
                      card.description ||
                      (isInteractive
                        ? "Tap to start or drag into your workflow."
                        : "");

                    const cardBody = (
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "16px",
                          padding: "1.25rem 1.35rem",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow:
                            "0 18px 40px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)",
                          color: "#f5f5f5",
                          fontWeight: 500,
                          letterSpacing: "0.03em",
                          transition:
                            "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
                          cursor: isInteractive ? "pointer" : "default",
                          opacity: isInteractive ? 1 : 0.45,
                        }}
                        onMouseEnter={(e) => {
                          if (!isInteractive) return;
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.transform = "translateY(-4px)";
                          el.style.boxShadow =
                            "0 24px 50px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08)";
                          el.style.borderColor = "rgba(255,255,255,0.14)";
                          el.style.background = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isInteractive) return;
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.transform = "translateY(0px)";
                          el.style.boxShadow =
                            "0 18px 40px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)";
                          el.style.borderColor = "rgba(255,255,255,0.08)";
                          el.style.background = "rgba(255,255,255,0.04)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            marginBottom: "0.25rem",
                            fontSize: "1rem",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.75)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "rgba(220,38,38,0.16)",
                              border: "1px solid rgba(220,38,38,0.35)",
                              color: "#dc2626",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "0.95rem",
                              color: "#f5f5f5",
                            }}
                          >
                            {card.label}
                          </span>
                        </div>
                        {description ? (
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "rgba(255,255,255,0.55)",
                              lineHeight: 1.4,
                            }}
                          >
                            {description}
                          </div>
                        ) : null}
                      </div>
                    );

                    if (isInteractive && card.href) {
                      return (
                        <Link
                          key={card.label}
                          href={card.href}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {cardBody}
                        </Link>
                      );
                    }

                    return React.cloneElement(cardBody, { key: card.label });
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
    </div>
  );
}
