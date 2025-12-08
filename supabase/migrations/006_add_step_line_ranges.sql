-- Add line range columns to steps table for export control
ALTER TABLE steps
ADD COLUMN line_range_start INTEGER,
ADD COLUMN line_range_end INTEGER;

-- Add check constraint to ensure valid line ranges
ALTER TABLE steps
ADD CONSTRAINT check_line_range_valid
CHECK (
  (line_range_start IS NULL AND line_range_end IS NULL) OR
  (line_range_start IS NOT NULL AND line_range_end IS NOT NULL AND line_range_start >= 1 AND line_range_end >= line_range_start)
);
