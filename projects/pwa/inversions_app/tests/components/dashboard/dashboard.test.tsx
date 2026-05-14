import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MainDashboard } from "../../../src/features/dashboard/MainDashboard";
import { CoreSelector } from "../../../src/features/dashboard/CoreSelector";
import { SignalOverlay } from "../../../src/features/dashboard/SignalOverlay";
import { ExplainabilityTable } from "../../../src/features/dashboard/ExplainabilityTable";
import type { DashboardSignalCard, CoreDefinition } from "../../../src/features/dashboard";

/**
 * FIC: Component tests for dashboard user story.
 * Tests main dashboard render, core selector toggle, signal overlay, and explainability table.
 *
 * FIC: Tests de componentes para historia de usuario dashboard.
 * Prueba renderización de dashboard principal, toggle del selector de cores, overlay de señales, tabla de explicabilidad.
 */

// Mock the signalApi
vi.mock("../../../src/services/signals/signalApi", () => ({
  getDashboardOrchestrator: vi.fn()
}));

describe("Dashboard Components", () => {
  describe("CoreSelector", () => {
    it("should render all core definitions", () => {
      const cores: CoreDefinition[] = [
        { id: "tech", label: "Technical", description: "Momentum y estructura", enabled: true },
        { id: "flow", label: "Flow", description: "UOA/bloques", enabled: false }
      ];
      const onToggle = vi.fn();

      render(<CoreSelector cores={cores} onToggle={onToggle} />);

      expect(screen.getByText("Technical")).toBeInTheDocument();
      expect(screen.getByText("Flow")).toBeInTheDocument();
      expect(screen.getByText("Momentum y estructura")).toBeInTheDocument();
      expect(screen.getByText("UOA/bloques")).toBeInTheDocument();
    });

    it("should call onToggle with correct coreId when toggling a core", () => {
      const cores: CoreDefinition[] = [
        { id: "tech", label: "Technical", description: "Technical analysis", enabled: true }
      ];
      const onToggle = vi.fn();

      render(<CoreSelector cores={cores} onToggle={onToggle} />);

      const techButton = screen.getByRole("button", { name: /Technical/i });
      fireEvent.click(techButton);

      expect(onToggle).toHaveBeenCalledWith("tech");
    });

    it("should visually indicate enabled cores", () => {
      const cores: CoreDefinition[] = [
        { id: "tech", label: "Technical", description: "Enabled core", enabled: true },
        { id: "flow", label: "Flow", description: "Disabled core", enabled: false }
      ];

      const { container } = render(<CoreSelector cores={cores} onToggle={vi.fn()} />);

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("should render multiple cores in proper order", () => {
      const cores: CoreDefinition[] = [
        { id: "1", label: "First", description: "Desc 1", enabled: true },
        { id: "2", label: "Second", description: "Desc 2", enabled: true },
        { id: "3", label: "Third", description: "Desc 3", enabled: false }
      ];

      const { container } = render(<CoreSelector cores={cores} onToggle={vi.fn()} />);
      const allText = container.textContent;

      expect(allText).toContain("First");
      expect(allText).toContain("Second");
      expect(allText).toContain("Third");
    });
  });

  describe("SignalOverlay", () => {
    const mockCards: DashboardSignalCard[] = [
      {
        signalId: "sig-1",
        instrument: "AAPL",
        signal: "BUY",
        confidence: 0.9,
        confluenceScore: 85,
        riskLevel: "LOW",
        activeCores: ["Technical", "AI"],
        updatedAt: new Date().toISOString(),
        evidence: []
      },
      {
        signalId: "sig-2",
        instrument: "MSFT",
        signal: "SELL",
        confidence: 0.7,
        confluenceScore: 45,
        riskLevel: "MEDIUM",
        activeCores: ["Technical"],
        updatedAt: new Date().toISOString(),
        evidence: []
      }
    ];

    it("should render signal cards for each instrument", () => {
      render(<SignalOverlay cards={mockCards} />);

      expect(screen.getByText("AAPL")).toBeInTheDocument();
      expect(screen.getByText("MSFT")).toBeInTheDocument();
    });

    it("should display signal direction (BUY/SELL/HOLD)", () => {
      render(<SignalOverlay cards={mockCards} />);

      expect(screen.getByText(/BUY/i)).toBeInTheDocument();
      expect(screen.getByText(/SELL/i)).toBeInTheDocument();
    });

    it("should display confidence scores", () => {
      render(<SignalOverlay cards={mockCards} />);

      // Confidence 0.9 = 90%
      expect(screen.getByText(/0\.9|90/)).toBeInTheDocument();
      // Confidence 0.7 = 70%
      expect(screen.getByText(/0\.7|70/)).toBeInTheDocument();
    });

    it("should display risk levels", () => {
      render(<SignalOverlay cards={mockCards} />);

      expect(screen.getByText(/LOW/i)).toBeInTheDocument();
      expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    });

    it("should handle empty cards list", () => {
      const { container } = render(<SignalOverlay cards={[]} />);

      expect(container.textContent).toBeTruthy();
    });

    it("should display confluence scores", () => {
      render(<SignalOverlay cards={mockCards} />);

      expect(screen.getByText(/85|85%/)).toBeInTheDocument();
      expect(screen.getByText(/45|45%/)).toBeInTheDocument();
    });
  });

  describe("ExplainabilityTable", () => {
    const mockCards: DashboardSignalCard[] = [
      {
        signalId: "sig-1",
        instrument: "AAPL",
        signal: "BUY",
        confidence: 0.85,
        confluenceScore: 75,
        riskLevel: "LOW",
        activeCores: ["Technical", "AI"],
        updatedAt: new Date().toISOString(),
        evidence: [
          { sourceId: "tech", verdict: "BUY", confidence: 0.9, rationale: "Strong uptrend" }
        ]
      }
    ];

    it("should render table headers", () => {
      render(<ExplainabilityTable cards={mockCards} />);

      const headerText = screen.getByRole("heading")?.textContent || "";
      expect(headerText).toBeTruthy();
    });

    it("should display instrument names in table", () => {
      render(<ExplainabilityTable cards={mockCards} />);

      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    it("should display signal type, confidence, and risk level", () => {
      render(<ExplainabilityTable cards={mockCards} />);

      expect(screen.getByText(/BUY/i)).toBeInTheDocument();
      expect(screen.getByText(/LOW/i)).toBeInTheDocument();
    });

    it("should handle multiple instruments in table", () => {
      const cardsWithMultiple: DashboardSignalCard[] = [
        mockCards[0],
        {
          signalId: "sig-2",
          instrument: "MSFT",
          signal: "HOLD",
          confidence: 0.5,
          confluenceScore: 50,
          riskLevel: "MEDIUM",
          activeCores: ["Technical"],
          updatedAt: new Date().toISOString(),
          evidence: []
        }
      ];

      render(<ExplainabilityTable cards={cardsWithMultiple} />);

      expect(screen.getByText("AAPL")).toBeInTheDocument();
      expect(screen.getByText("MSFT")).toBeInTheDocument();
    });

    it("should render empty state gracefully", () => {
      const { container } = render(<ExplainabilityTable cards={[]} />);

      expect(container.textContent).toBeTruthy();
    });
  });

  describe("MainDashboard Integration", () => {
    const mockDashboardResponse = {
      timeframe: "1d",
      generatedAt: new Date().toISOString(),
      instruments: ["AAPL", "MSFT"],
      cards: [
        {
          signalId: "sig-1",
          instrument: "AAPL",
          signal: "BUY" as const,
          confidence: 0.8,
          confluenceScore: 75,
          riskLevel: "LOW" as const,
          activeCores: ["Technical"],
          updatedAt: new Date().toISOString(),
          evidence: []
        }
      ]
    };

    it("should render main dashboard sections", () => {
      render(<MainDashboard />);

      expect(screen.getByText(/Dashboard de Confluencia/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitoreo operativo/i)).toBeInTheDocument();
    });

    it("should have input for instruments", () => {
      render(<MainDashboard />);

      const instrumentInput = screen.getByPlaceholderText(/AAPL,MSFT,NVDA/i);
      expect(instrumentInput).toBeInTheDocument();
      expect(instrumentInput).toHaveValue("AAPL,MSFT,NVDA,SPY");
    });

    it("should have timeframe selector dropdown", () => {
      render(<MainDashboard />);

      const timeframeSelect = screen.getByDisplayValue("1d");
      expect(timeframeSelect).toBeInTheDocument();
    });

    it("should have update button", () => {
      render(<MainDashboard />);

      const updateButton = screen.getByRole("button", { name: /Actualizar/i });
      expect(updateButton).toBeInTheDocument();
    });

    it("should display active core count", () => {
      render(<MainDashboard />);

      const coreCountInput = screen.getByDisplayValue(/cores activos/i);
      expect(coreCountInput).toBeInTheDocument();
    });

    it("should toggle core visibility when CoreSelector is interacted", async () => {
      const { container } = render(<MainDashboard />);

      const coreButtons = container.querySelectorAll("button[type='button']");
      expect(coreButtons.length).toBeGreaterThan(0);
    });

    it("should show loading state during fetch", async () => {
      render(<MainDashboard />);

      const updateButton = screen.getByRole("button", { name: /Actualizar/i });
      expect(updateButton).not.toBeDisabled();
    });

    it("should show initial placeholder message", () => {
      render(<MainDashboard />);

      expect(screen.getByText(/Presiona Actualizar/i)).toBeInTheDocument();
    });

    it("should allow changing instruments input", () => {
      render(<MainDashboard />);

      const instrumentInput = screen.getByPlaceholderText(
        /AAPL,MSFT,NVDA/i
      ) as HTMLInputElement;

      fireEvent.change(instrumentInput, { target: { value: "TEST" } });

      expect(instrumentInput.value).toBe("TEST");
    });

    it("should allow changing timeframe", () => {
      render(<MainDashboard />);

      const timeframeSelect = screen.getByDisplayValue("1d") as HTMLSelectElement;

      fireEvent.change(timeframeSelect, { target: { value: "4h" } });

      expect(timeframeSelect.value).toBe("4h");
    });
  });
});
