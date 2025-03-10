import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card Component", () => {
  it("renders Card with correct classes", () => {
    render(<Card data-testid="card">Card Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("text-card-foreground");
    expect(card).toHaveClass("rounded-xl");
  });

  it("renders CardHeader with correct classes", () => {
    render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
    const header = screen.getByTestId("card-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("px-6");
  });

  it("renders CardTitle with correct classes", () => {
    render(<CardTitle data-testid="card-title">Title Content</CardTitle>);
    const title = screen.getByTestId("card-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("font-semibold");
    expect(title).toHaveTextContent("Title Content");
  });

  it("renders CardDescription with correct classes", () => {
    render(
      <CardDescription data-testid="card-description">
        Description Content
      </CardDescription>,
    );
    const description = screen.getByTestId("card-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-muted-foreground");
    expect(description).toHaveClass("text-sm");
  });

  it("renders CardContent with correct classes", () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId("card-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("px-6");
  });

  it("renders CardFooter with correct classes", () => {
    render(<CardFooter data-testid="card-footer">Footer Content</CardFooter>);
    const footer = screen.getByTestId("card-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("items-center");
    expect(footer).toHaveClass("px-6");
  });

  it("renders a complete card with all components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Main content goes here</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("Main content goes here")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
