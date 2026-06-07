import sys
import json
import os
from supabase import create_client, Client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Missing supabase credentials", file=sys.stderr)
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

def main():
    if len(sys.argv) < 3:
        print("Usage: python news_to_case.py <brief_id> <user_id>")
        sys.exit(1)
        
    brief_id = sys.argv[1]
    user_id = sys.argv[2]
    
    # 1. Fetch brief
    brief_res = supabase.table("news_headlines").select("*").eq("id", brief_id).execute()
    if not brief_res.data:
        print("Brief not found", file=sys.stderr)
        sys.exit(1)
        
    brief = brief_res.data[0]
    
    # 2. Infer type from keywords
    keywords = str(brief.get("keywords", "")).lower()
    case_type = "profitability"
    if "growth" in keywords or "expansion" in keywords:
        case_type = "growth"
    elif "market" in keywords or "size" in keywords or "estimate" in keywords:
        case_type = "market_sizing"
    
    # 3. Create case data
    source_name = brief.get('source_name', 'News')
    title = f"{source_name} Strategy: {brief.get('title', 'Unknown')}"
    prompt_text = f"You are consulting for a company featured in recent news: {brief.get('summary', '')}. Focus on {case_type}."
    
    # Simple extraction logic for interview_meta.firm based on keywords
    firm = None
    for f in ["MBB", "McKinsey", "BCG", "Bain", "Deloitte"]:
        if f.lower() in keywords:
            firm = f
            break
            
    new_case = {
        "title": title,
        "type": case_type,
        "difficulty": "medium",
        "content": prompt_text,
        "hint": brief.get("summary", "A short case based on recent events."),
        "is_active": True,
        "source_brief_id": brief_id,
        "interview_meta": {
            "firm": firm,
            "est_minutes": 15
        }
    }
    
    res = supabase.table("cases").insert(new_case).execute()
    
    if res.data:
        print(json.dumps({"case_id": res.data[0]["id"]}))
    else:
        print("Failed to insert case", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
