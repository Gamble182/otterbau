// src/lib/utils/import-helpers.ts
import type { Entry, Person } from "@/lib/schemas/zod";

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    format: string;
    totalPersons: number;
    totalEntries: number;
    workEntries: number;
    expenseEntries: number;
    projectEntries: number;
    dateRange: { from?: string; to?: string };
  };
}

export class ImportValidator {
  static validateJSON(data: any): ImportValidationResult {
    const result: ImportValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        format: "unknown",
        totalPersons: 0,
        totalEntries: 0,
        workEntries: 0,
        expenseEntries: 0,
        projectEntries: 0,
        dateRange: {},
      },
    };

    try {
      // Detect format
      if (data.expenses && Array.isArray(data.expenses)) {
        result.stats.format = "simple_expenses";
        this.validateSimpleExpenses(data, result);
      } else if (data.persons && data.entries) {
        result.stats.format = "full_backup";
        this.validateFullBackup(data, result);
      } else {
        result.errors.push("Unbekanntes Datenformat");
        result.isValid = false;
      }

      // General validations
      if (result.stats.totalEntries === 0) {
        result.warnings.push("Keine Einträge zum Importieren gefunden");
      }
    } catch (error) {
      result.errors.push(
        `Validierungsfehler: ${
          error instanceof Error ? error.message : "Unbekannter Fehler"
        }`
      );
      result.isValid = false;
    }

    return result;
  }

  private static validateSimpleExpenses(
    data: any,
    result: ImportValidationResult
  ) {
    if (!Array.isArray(data.expenses)) {
      result.errors.push("expenses muss ein Array sein");
      result.isValid = false;
      return;
    }

    const buyers = new Set<string>();
    const dates: string[] = [];

    data.expenses.forEach((expense: any, index: number) => {
      // Required fields
      if (!expense.position) {
        result.errors.push(`Expense ${index + 1}: Position fehlt`);
        result.isValid = false;
      }
      if (!expense.buyer) {
        result.errors.push(`Expense ${index + 1}: Käufer fehlt`);
        result.isValid = false;
      }
      if (!expense.date) {
        result.errors.push(`Expense ${index + 1}: Datum fehlt`);
        result.isValid = false;
      }
      if (typeof expense.total !== "number" || expense.total < 0) {
        result.errors.push(`Expense ${index + 1}: Ungültiger Gesamtbetrag`);
        result.isValid = false;
      }

      // Collect data for stats
      if (expense.buyer) buyers.add(expense.buyer);
      if (expense.date) dates.push(expense.date);

      // Warnings
      if (!expense.category) {
        result.warnings.push(`Expense ${index + 1}: Kategorie fehlt`);
      }
    });

    result.stats.totalPersons = buyers.size;
    result.stats.totalEntries = data.expenses.length;
    result.stats.expenseEntries = data.expenses.length;

    if (dates.length > 0) {
      const sortedDates = dates.sort();
      result.stats.dateRange = {
        from: sortedDates[0],
        to: sortedDates[sortedDates.length - 1],
      };
    }
  }

  private static validateFullBackup(data: any, result: ImportValidationResult) {
    // Validate persons
    if (data.persons && Array.isArray(data.persons)) {
      data.persons.forEach((person: any, index: number) => {
        if (!person.name) {
          result.errors.push(`Person ${index + 1}: Name fehlt`);
          result.isValid = false;
        }
      });
      result.stats.totalPersons = data.persons.length;
    }

    // Validate entries
    if (data.entries && Array.isArray(data.entries)) {
      const dates: string[] = [];

      data.entries.forEach((entry: any, index: number) => {
        if (
          !entry.type ||
          !["work", "expense", "projectCost"].includes(entry.type)
        ) {
          result.errors.push(
            `Entry ${index + 1}: Ungültiger oder fehlender Typ`
          );
          result.isValid = false;
        }
        if (!entry.date) {
          result.errors.push(`Entry ${index + 1}: Datum fehlt`);
          result.isValid = false;
        }
        if (!entry.payload) {
          result.errors.push(`Entry ${index + 1}: Payload fehlt`);
          result.isValid = false;
        }

        // Count by type
        switch (entry.type) {
          case "work":
            result.stats.workEntries++;
            break;
          case "expense":
            result.stats.expenseEntries++;
            break;
          case "projectCost":
            result.stats.projectEntries++;
            break;
        }

        if (entry.date) dates.push(entry.date);
      });

      result.stats.totalEntries = data.entries.length;

      if (dates.length > 0) {
        const sortedDates = dates.sort();
        result.stats.dateRange = {
          from: sortedDates[0],
          to: sortedDates[sortedDates.length - 1],
        };
      }
    }
  }
}

export class ImportConverter {
  // Convert simple expenses to full entry format
  static convertSimpleExpensesToEntries(
    expenses: any[]
  ): Omit<Entry, "id" | "createdAt" | "updatedAt">[] {
    return expenses.map((expense) => ({
      type: "expense" as const,
      date: expense.date,
      tags: [expense.category || "Unbekannt"],
      payload: {
        position: expense.position,
        manufacturer: expense.manufacturer,
        category: expense.category || "Unbekannt",
        type: expense.type,
        extra: expense.extra,
        apartment: expense.apartment,
        buyer: expense.buyer,
        qty: expense.qty || 1,
        unitPrice: expense.unitPrice || expense.total || 0,
        total: expense.total || 0,
        currency: "EUR",
        note: expense.note,
      },
    }));
  }

  // Extract unique persons from various data formats
  static extractPersonsFromData(data: any): string[] {
    const persons = new Set<string>();

    if (data.expenses && Array.isArray(data.expenses)) {
      data.expenses.forEach((expense: any) => {
        if (expense.buyer) persons.add(expense.buyer);
      });
    }

    if (data.entries && Array.isArray(data.entries)) {
      data.entries.forEach((entry: any) => {
        if (entry.type === "work" && entry.payload?.personName) {
          persons.add(entry.payload.personName);
        }
      });
    }

    if (data.persons && Array.isArray(data.persons)) {
      data.persons.forEach((person: any) => {
        if (person.name) persons.add(person.name);
      });
    }

    return Array.from(persons).sort();
  }
}

export class ImportPreprocessor {
  // Clean and normalize data before import
  static preprocessData(data: any): any {
    if (data.expenses && Array.isArray(data.expenses)) {
      data.expenses = data.expenses.map((expense: any) => ({
        ...expense,
        position: expense.position?.trim() || "",
        buyer: expense.buyer?.trim() || "",
        category: expense.category?.trim() || "Unbekannt",
        manufacturer: expense.manufacturer?.trim(),
        type: expense.type?.trim(),
        extra: expense.extra?.trim(),
        apartment: expense.apartment?.trim(),
        note: expense.note?.trim(),
        qty: Math.max(expense.qty || 1, 0.1), // Ensure positive quantity
        unitPrice: Math.max(expense.unitPrice || 0, 0),
        total: Math.max(expense.total || 0, 0),
      }));
    }

    if (data.entries && Array.isArray(data.entries)) {
      data.entries = data.entries.map((entry: any) => ({
        ...entry,
        date: this.normalizeDate(entry.date),
        tags: Array.isArray(entry.tags) ? entry.tags : [],
      }));
    }

    if (data.persons && Array.isArray(data.persons)) {
      data.persons = data.persons
        .map((person: any) => ({
          ...person,
          name: person.name?.trim() || "",
        }))
        .filter((person: any) => person.name); // Remove empty names
    }

    return data;
  }

  private static normalizeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateString}`);
      }
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch {
      return new Date().toISOString().split("T")[0]; // Fallback to today
    }
  }
}

// Utility function to generate sample import files
export class ImportSampleGenerator {
  static generateSampleExpenses(): any {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      importType: "SIMPLE_EXPENSES",
      expenses: [
        {
          position: "Akkuschrauber",
          manufacturer: "Bosch",
          category: "🔧 Werkzeug",
          type: "Elektrowerkzeug",
          extra: "+ 2x 4,0mAh Akku",
          apartment: "",
          buyer: "Yannik",
          qty: 1.0,
          unitPrice: 280.0,
          total: 280.0,
          date: "2023-03-06",
          note: "Beispieldaten",
        },
        {
          position: "Farbe",
          manufacturer: "Alpina",
          category: "🎨 Farbe & Lack",
          type: "Wandfarbe",
          extra: "Weiß, 10L",
          apartment: "EW",
          buyer: "Lisa",
          qty: 2.0,
          unitPrice: 45.0,
          total: 90.0,
          date: "2023-03-10",
          note: "Für Wohnzimmer",
        },
      ],
    };
  }

  static generateSampleFullBackup(): any {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      persons: [
        {
          id: crypto.randomUUID(),
          name: "Yannik",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "Lisa",
          createdAt: new Date().toISOString(),
        },
      ],
      entries: [
        {
          id: crypto.randomUUID(),
          type: "work",
          date: "2023-07-15",
          tags: ["Hausrenovierung"],
          payload: {
            personId: crypto.randomUUID(),
            personName: "Yannik",
            hours: 8.0,
            project: "Hausrenovierung",
            note: "Beispieldaten",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  }

  static downloadSample(type: "expenses" | "full_backup") {
    const data =
      type === "expenses"
        ? this.generateSampleExpenses()
        : this.generateSampleFullBackup();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `otterbau-sample-${type}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
